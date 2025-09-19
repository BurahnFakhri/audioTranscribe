// src/services/transcription.service.ts
import mongoose from 'mongoose';
import TranscriptionModel, { ITranscription } from '../models/transcription.model';
import { downloadAudio } from './download.service';
import MockTranscriber from './transcribers/mock.transcriber';
import logger from '../utils/logger';
import { enqueueTranscriptionJob } from '../queue';
import { ListOptions, ListResult } from './types/transcription.types';


const transcriber = new MockTranscriber();

/**
 * Create a new Transcription document with status 'pending'.
 * Returns the created document.
 */
export async function createTranscriptionRecord(audioUrl: string): Promise<ITranscription> {
  const doc = await TranscriptionModel.create({
    audioUrl,
    status: 'pending',
    attempts: 0,
} as ITranscription);
  await enqueueTranscriptionJob(String(doc._id), audioUrl);
  return doc;
}

/**
 * Process an existing transcription document:
 *  - mark processing
 *  - download audio (validates MIME, saves file)
 *  - run transcriber (mock or real)
 *  - update doc with result or failure
 *
 * This is intended to be called by a worker (Agenda / cron / other).
 */
export async function processTranscription(
  transcriptionId: string,
  audioUrl?: string,
  opts?: { forceRedownload?: boolean }
): Promise<ITranscription> {
  if (!mongoose.isValidObjectId(transcriptionId)) {
    throw new Error(`Invalid transcriptionId: ${transcriptionId}`);
  }

  const doc = await TranscriptionModel.findById(transcriptionId);
  if (!doc) {
    throw new Error(`Transcription not found: ${transcriptionId}`);
  }

  // If audioUrl not passed, use one from the DB doc
  const effectiveAudioUrl = audioUrl || doc.audioUrl;
  if (!effectiveAudioUrl) {
    throw new Error('No audioUrl provided or found on transcription document');
  }

  // Idempotency: if already completed and not forcing, return early
  if (doc.status === 'completed' && !opts?.forceRedownload) {
    logger.info({ transcriptionId }, 'Skipping processing: already completed');
    return doc;
  }

  // Update doc to processing
  try {
    doc.status = 'processing';
    // doc.processingStartedAt = new Date();
    await doc.save();
  } catch (err: any) {
    logger.warn({ err, transcriptionId }, 'Could not set status to processing (continuing anyway)');
  }

  try {
    // Download audio (validates content-type and saves to disk)
    const { buffer, contentType, size, savedPath } = await downloadAudio(effectiveAudioUrl);
    logger.info({ transcriptionId, size, contentType, savedPath }, 'Audio downloaded, invoking transcriber');

    // Transcribe using pluggable transcriber (mock for now)
    const text = await transcriber.transcribe(buffer, effectiveAudioUrl);

    // Update doc with results
    doc.filePath = String(savedPath);
    doc.transcription = text;
    doc.status = 'completed';
    doc.attempts = (doc.attempts || 0) + 1;
    await doc.save();

    logger.info({ transcriptionId, status: doc.status }, 'Transcription completed successfully');
    return doc;
  } catch (err: any) {
    logger.error({ err, transcriptionId }, 'Transcription processing failed');
    try {
      doc.status = 'failed';
      doc.error = err?.message || String(err);
      doc.attempts = (doc.attempts || 0) + 1;
      await doc.save();
    } catch (innerErr: any) {
      logger.error({ innerErr, transcriptionId }, 'Failed to update transcription doc after processing failure');
    }
    throw err;
  }
}


export async function listTranscriptions(opts: ListOptions = {}): Promise<ListResult<ITranscription>> {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const skip = (page - 1) * limit;
    const sort = opts.sort?.trim() || '-createdAt';
    const filter: any = {};
    if (opts.status) filter.status = opts.status;
    if (opts.search) filter.audioUrl = { $search: opts.search };
    if (opts.from || opts.to) {
        filter.createdAt = {};
        if (opts.from) filter.createdAt.$gte = opts.from;
        if (opts.to) filter.createdAt.$lte = opts.to;
    }
    const projection = { __v: 0 };
    const [items, total] = await Promise.all([
        TranscriptionModel.find(filter).sort(sort).skip(skip).limit(limit).select(projection).lean().exec(),
        TranscriptionModel.countDocuments(filter).exec()
    ]);

    return { items, total, page, limit };
}


export default {
  createTranscriptionRecord,
  processTranscription,
  listTranscriptions
};
