export default class MockTranscriber {
  /**
   * Simulate a transcription run.
   * @param buffer audio bytes
   * @param audioUrl original url
   */
  async transcribe(buffer: Buffer, audioUrl?: string): Promise<string > {
    const text = `Mocked transcription for ${audioUrl ?? 'audio'} — ${Math.round(buffer.length / 1024)} KB processed.`;
    return text;
  }
}
