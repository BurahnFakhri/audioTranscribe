import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api/";

export type TranscriptionRecordType  = {
  _id: string;
  audioUrl: string;
  transcription: string;
  filePath: string | null;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string;
  createdAt: Date;
  updatedAt: Date;
};

interface TransactionListApiResponseType  {
  success: boolean;
  data: { 
    items: TranscriptionRecordType[] | [],
    total: number;
    page: number;
    limit: number 
  };
  error?: string
}

interface CreateTranscriptionApiResponseType {
  success: boolean;
  data: { 
    _id: string,
    status: string;
    audioUrl: string;
    createdAt: Date 
  } | null;
  error?: string
}


/**
 * GET list of transcriptions.
 * Accepts an optional AbortSignal (works with axios when passed as `signal`).
 */
export async function fetchTranscriptions(signal?: AbortSignal): Promise<TransactionListApiResponseType> {
  try {
    const res = await axios.get<TransactionListApiResponseType>(BASE + 'transcription?createdAt=-createdAt', { signal });
    if(res.data.success) {
      return res.data;
    } else {
      return  {
        success: false,
        error: res.data.error || 'Something went wrong',
        data: {
          items: [],
          total: 0,
          page: 0,
          limit: 0
        }
      };
    }
  } catch (err:unknown) {
    return  {
      success: false,
      error: (err instanceof Error)? err.message : 'Something went wrong',
      data: {
        items: [],
        total: 0,
        page: 0,
        limit: 0
      }
    };
  }
}

/**
 * Create a transcription (POST).
 * Returns the created object (or at least { id: string } as your earlier code expected).
 */
export async function createTranscription(audioUrl: string): Promise<CreateTranscriptionApiResponseType> {
  try {
    const res = await axios.post<CreateTranscriptionApiResponseType>(
      BASE + 'transcription',
      { audioUrl },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if(res.data.success) {
      return res.data 
    } else {
      return {...res.data, data: null }
    }
  } catch(err: unknown) {
    return {
      success: false,
      data: null,
      error: (err instanceof Error) ? err.message : 'Something went wrong'
    }
  }
}
