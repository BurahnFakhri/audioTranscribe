import mongoose, { Document, Model, Schema } from "mongoose";

type StatusType = 'pending' | 'processing' | 'completed' | 'failed';

export interface ITranscription extends Document {
  audioUrl: string;
  transcription: string;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const transcriptionSchema = new Schema<ITranscription>(
  {
    audioUrl: { type: String, required: true, trim: true },
    transcription: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    }
  },
  { timestamps: true }
);

// Export model
const TranscriptionModel: Model<ITranscription> = mongoose.models.Transcription || mongoose.model<ITranscription>('Transcription', transcriptionSchema, 'transcriptions');

export default TranscriptionModel;
