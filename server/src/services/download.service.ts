import axios from 'axios';
import axiosRetry from 'axios-retry';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import config from '../config';
import logger from '../utils/logger';

axiosRetry(axios, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
});

const AUDIO_MIME_PREFIX = 'audio/';

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err: any) {
    // if directory exists
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Download a remote URL, but only if it's an audio file.
 * Saves the file into local storageDir and returns metadata.
 */
export async function downloadAudio(url: string): Promise<{
  buffer: Buffer;
  contentType?: string;
  size: number;
  savedPath?: string;
}> {
  // perform HEAD first to quickly check content-type & size
  try {
    const head = await axios.head(url, { timeout: 5000, maxRedirects: 5 });
    const ct = (head.headers['content-type'] || '').toString();
    const contentLengthHeader = head.headers['content-length'];
    const lengthFromHead = contentLengthHeader ? Number(contentLengthHeader) : undefined;

    if (!ct || !ct.startsWith(AUDIO_MIME_PREFIX)) {
      throw new Error(`URL does not point to an audio resource (content-type: ${ct || 'unknown'})`);
    }
    const maxByte = 50 * 1024 * 1024; // default 50MB
    if (lengthFromHead && lengthFromHead > maxByte) {
      throw new Error(`Remote file too large (${lengthFromHead} bytes). Max allowed: ${maxByte}`);
    }
  } catch (headErr: any) {
    // If HEAD fails (some servers block it), we continue to GET and validate after receiving headers.
    logger.warn({ err: headErr, url }, 'HEAD request failed or blocked; will attempt GET and validate');
  }

  // Now GET the resource (arraybuffer)
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 20_000,
    maxContentLength: Number(process.env.MAX_DOWNLOAD_BYTES || 50 * 1024 * 1024),
    maxBodyLength: Number(process.env.MAX_DOWNLOAD_BYTES || 50 * 1024 * 1024),
  });

  const contentType = (res.headers['content-type'] || '').toString();
  if (!contentType.startsWith(AUDIO_MIME_PREFIX)) {
    throw new Error(`Downloaded content is not audio (content-type: ${contentType || 'unknown'})`);
  }

  const buffer = Buffer.from(res.data);
  const size = buffer.length;

  // ensure storage directory exists
  const storageDir = config.storageDir || 'uploads';
  await ensureDir(storageDir);

  // create a safe filename using sha1 hash of url + timestamp (keeps collisions tiny)
  const hash = crypto.createHash('sha1').update(url + Date.now().toString()).digest('hex');
  // choose extension based on content-type if possible (fall back to .mp3)
  const ext = (contentType.split('/')[1] || 'mp3').split(';')[0];
  const filename = `${hash}.${ext}`;
  const savedPath = path.join(storageDir, filename);

  await fs.writeFile(savedPath, buffer);

  logger.info({ url, savedPath, size, contentType }, 'Downloaded and saved audio');

  return { buffer, contentType, size, savedPath };
}