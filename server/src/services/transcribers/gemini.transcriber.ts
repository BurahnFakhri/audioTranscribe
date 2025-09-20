// services/GeminiTranscriber.ts
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import MockTranscriber from "./mock.transcriber";
import logger from '../../utils/logger';

export default class GeminiTranscriber {
  private ai: GoogleGenAI;
  private fallback: MockTranscriber;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in the environment.");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.fallback = new MockTranscriber();
  }

  /**
   * Transcribe an audio file with Gemini, fallback to MockTranscriber on failure.
   */
  async transcribe(filePath: string, audioUrl?: string, mime = "audio/mpeg"): Promise<string> {
    try {
      // Upload directly from uploads/ path
      const uploaded = await this.ai.files.upload({
        file: filePath,
        config: { mimeType: mime },
      });

      if (!uploaded?.uri) throw new Error("Gemini upload failed (no uri returned)");

      // Request transcription
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
          createPartFromUri(uploaded.uri, uploaded.mimeType ?? mime),
          "transcribe this audio",
        ]),
      });

      const text = this.extractText(response);
      if (!text) {
        logger.warn({ filePath }, "Gemini returned empty transcript. Using fallback.");
        return this.fallback.transcribe(Buffer.from([]), audioUrl);
      }

      return text.trim();
    } catch (err: any) {
      logger.error({ err, filePath }, "GeminiTranscriber failed, using fallback");
      return this.fallback.transcribe(Buffer.from([]), audioUrl);
    }
  }

  private extractText(resp: any): string | null {
    if (!resp) return null;
    if (typeof resp.text === "string" && resp.text.trim()) return resp.text;
    try {
      const nested = resp.outputs?.[0]?.content?.[0]?.text;
      if (typeof nested === "string" && nested.trim()) return nested;
    } catch {}
    return null;
  }
}
