import { Request, Response } from 'express';
import {  createTranscriptionRecord, listTranscriptions } from '../services/transcription.service';
import logger from '../utils/logger';

export async function postTranscription(req: Request, res: Response) {
  const { audioUrl } = req.body as { audioUrl: string };

  try {
    const doc = await createTranscriptionRecord(audioUrl);
    return res.status(201).json({
      success: true,
      data: {
        _id: doc._id,
        status: doc.status,
        audioUrl: doc.audioUrl,
        createdAt: doc.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'transcription_failed' });
  }
}

/**
 * GET /api/v1/transcriptions
 * Query params:
 *  - page (default 1)
 *  - limit (default 20)
 *  - status (optional: pending|processing|completed|failed)
 *  - sort (optional: e.g. "-createdAt" or "createdAt")
 */
export async function getTranscriptions(req: Request, res: Response) {
  try {
    const opts = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        status: req.query.status as string | undefined,
        sort: req.query.sort as string | undefined
    };
    const result = await listTranscriptions(opts);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error({ err }, 'Failed to list transcriptions');
    return res.status(500).json({ success: false, error: err?.message || 'failed_to_list' });
  }
}

