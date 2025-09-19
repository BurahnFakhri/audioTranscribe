import mongoose, { Document, Model, Schema } from "mongoose";

type StatusType = 'pending' | 'processing' | 'completed' | 'failed';

export interface ITranscription extends Document {
  audioUrl: string;
  transcription: string;
  filePath: string | null;
  attempts: number;
  status: StatusType;
  error: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const transcriptionSchema = new Schema<ITranscription>(
  {
    audioUrl: { type: String, required: true, trim: true },
    transcription: { type: String, default: '' },
    filePath: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: { type: String }
  },
  { timestamps: true }
);

// Export model
const TranscriptionModel: Model<ITranscription> = mongoose.models.Transcription || mongoose.model<ITranscription>('Transcription', transcriptionSchema, 'transcriptions');

export default TranscriptionModel;
