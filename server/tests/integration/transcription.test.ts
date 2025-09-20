import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import * as downloadService from '../../src/services/download.service';
import TranscriptionModel  from '../../src/models/transcription.model';
import agenda from '../../src/queue/agenda';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // stop agenda if present
  try {
    if (agenda && typeof agenda.stop === 'function') {
      await agenda.stop();
    }
  } catch (err) {
    console.warn('Error stopping agenda', err);
  }

  // disconnect mongoose
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.warn('Error disconnecting mongoose', err);
  }

  // stop in-memory mongo
  if (mongoServer) {
    try {
      await mongoServer.stop();
    } catch (err) {
      console.warn('Error stopping mongo-memory-server', err);
    }
  }
});

beforeEach(async () => {
  await TranscriptionModel.deleteMany({});
});

describe('Health', () => {
  it('GET /health responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'Running' });
  });
});

describe('POST /api/transcriptions', () => {
  const fakeBuffer = Buffer.from('fake-audio-bytes');

  beforeAll(() => {
    jest.spyOn(downloadService, 'downloadAudio').mockImplementation(async (url: string) => {
      return {
        buffer: fakeBuffer,
        contentType: 'audio/mpeg',
        size: fakeBuffer.length,
        savedPath: 'uploads/fake.mp3',
      } as any;
    });
  });

  afterAll(() => {
    (downloadService.downloadAudio as jest.Mock).mockRestore();
  });

  it('creates a transcription and stores in DB', async () => {
    const payload = { audioUrl: 'https://download.samplelib.com/mp3/sample-3s.mp3' };
    const res = await request(app).post('/api/transcription').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');

    const doc = await TranscriptionModel.findOne({ audioUrl: payload.audioUrl }).lean();
    expect(doc).toBeDefined();
    expect(doc?.audioUrl).toBe(payload.audioUrl);
  });

  it('Send Empty  audioURL', async () => {
    const payload = { audioUrl: '' };
    const res = await request(app).post('/api/transcription').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});