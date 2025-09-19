import agenda from './agenda';
import logger from '../utils/logger';

export async function enqueueTranscriptionJob(transcriptionId: string, audioUrl: string) {
  const jobData = { transcriptionId, audioUrl };

  const opts = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30 * 1000 }, // 30s base
    removeOnComplete: true,
    removeOnFail: false
  };

  try {
    const job = await agenda.now('transcription:process', jobData);
    logger.info({ transcriptionId, jobId: job.attrs._id }, 'Enqueued transcription job');
    return job.attrs;
  } catch (err: any) {
    logger.error({ err, transcriptionId }, 'Failed to enqueue transcription job');
    throw err;
  }
}