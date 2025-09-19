import Agenda from 'agenda';
import config from '../config';
import logger from '../utils/logger';

// create Agenda instance
const agenda = new Agenda({
  db: {
    address: config.mongoUri,      
    collection: 'agendaJobs'
  },
  processEvery: '5 seconds',
  maxConcurrency: 5,
});

agenda.on('start', (job) => logger.info({ job: job.attrs }, `Agenda job started: ${job.attrs.name}`));
agenda.on('success', (job) => logger.info({ job: job.attrs }, `Agenda job succeeded: ${job.attrs.name}`));
agenda.on('fail', (err, job) => logger.error({ err, job: job?.attrs }, `Agenda job failed: ${job?.attrs?.name}`));

export default agenda;
