import { Router } from 'express';
import { validate } from '../middleware/validate';
import { getTranscriptions, postTranscription } from '../controllers/transcription.controller';
import { createSchema } from '../middleware/validateSchema/transcription.validSchema';

const router = Router();

router.post('/', validate(createSchema, 'body'), postTranscription);
router.get('/', getTranscriptions);

export default router;
