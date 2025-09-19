// src/worker.ts
import './config'; // ensure env loaded if needed
import agenda from './queue/agenda';
import logger from './utils/logger';
import TranscriptionModel from './models/transcription.model';
import { processTranscription } from './services/transcription.service';
import { connectDB } from './config/db';

// Define job processor
agenda.define('transcription:process', { concurrency: 2, lockLifetime: 1000 * 60 * 60 }, async (job) => {
  const data = job.attrs.data as { transcriptionId?: string; audioUrl?: string };
  const { transcriptionId, audioUrl } = data;

  if (!transcriptionId || !audioUrl) {
    throw new Error('Invalid job payload: transcriptionId or audioUrl missing');
  }

  // mark DB doc as processing 
  try {
    await TranscriptionModel.findByIdAndUpdate(transcriptionId, {
      status: 'processing',
      processingStartedAt: new Date(),
    });
  } catch (err) {
    logger.warn({ err, transcriptionId }, 'Could not update transcription status to processing');
  }

  // Do the actual work (download + transcribe)
  // createAndTranscribe will update the doc on success/failure
  await processTranscription(transcriptionId, audioUrl);
});

// Start the worker
(async function startWorker() {
  try {
    await connectDB();
    await agenda.start();
    logger.info('Agenda worker started and listening for jobs');
  } catch (err: any) {
    logger.fatal({ err }, 'Failed to start agenda worker');
    process.exit(1);
  }

  // graceful shutdown
  const stop = async (signal?: string) => {
    logger.info({ signal }, 'Shutting down agenda worker...');
    try {
      await agenda.stop(); // wait for running jobs to finish
      logger.info('Agenda stopped');
      // small delay so logs flush
      setTimeout(() => process.exit(0), 100);
    } catch (err) {
      logger.error({ err }, 'Error stopping agenda');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
})();
