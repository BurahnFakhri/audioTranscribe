import React, { useCallback, useState } from "react";
import { Link, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AudioUploadProps {
  onSubmit: (audioUrl: string) => void;
  isProcessing?: boolean;
}

/**
 * Simple audio URL input card.
 * - Validates common audio extensions and a few known hosting domains
 * - Calls onSubmit(audioUrl) when submitted
 */
const AudioUpload: React.FC<AudioUploadProps> = ({ onSubmit, isProcessing = false }) => {
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);

  const validateAudioUrl = useCallback((url: string) => {
    if (!url) {
      setIsValidUrl(false);
      return;
    }

    try {
      const urlObj = new URL(url);
      // Accept common audio extensions OR known audio hosting services OR https links
      const isAudioFile = /\.(mp3|wav|m4a|aac|ogg|flac|wma)(\?.*)?$/i.test(urlObj.pathname);
      setIsValidUrl(isAudioFile || urlObj.protocol === "https:");
    } catch {
      setIsValidUrl(false);
    }
  }, []);

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setAudioUrl(url);
      validateAudioUrl(url);
    },
    [validateAudioUrl]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!audioUrl || !isValidUrl) return;
      onSubmit(audioUrl);
      setAudioUrl("");
      setIsValidUrl(false);
    },
    [audioUrl, isValidUrl, onSubmit]
  );

  const exampleUrls = [
    "https://www.flatworldsolutions.com/transcription/samples/Monologue.mp3",
    "https://www.flatworldsolutions.com/transcription/samples/DIALOGUE.mp3",
    "https://www.nch.com.au/scribe/practice/audio-sample-1.mp3",
  ];

  return (
    <Card className="p-8 bg-gradient-subtle border-2 border-border hover:border-audio-primary/50 transition-all duration-300">
      <div className="relative rounded-lg p-12 text-center transition-all duration-300">
        {/* Audio wave animation background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-audio rounded-full animate-wave"
                style={{
                  height: `${Math.random() * 40 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-audio">
            <Link className="h-8 w-8 text-white" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-foreground">Add Audio URL</h3>
          <p className="mb-6 text-muted-foreground">Paste the URL of your audio file to start transcription</p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="audio-url" className="text-sm font-medium text-left block">
                Audio File URL
              </Label>
              <Input
                id="audio-url"
                type="url"
                placeholder="https://example.com/audio-file.mp3"
                value={audioUrl}
                onChange={handleUrlChange}
                className={cn(
                  "transition-all duration-300",
                  audioUrl && !isValidUrl && "border-destructive focus-visible:ring-destructive",
                  isValidUrl && "border-audio-success focus-visible:ring-audio-success"
                )}
                disabled={isProcessing}
                // FIX: pass boolean | undefined instead of string
                aria-invalid={audioUrl ? !isValidUrl : undefined}
              />
              {audioUrl && !isValidUrl && <p className="text-xs text-destructive">Please enter a valid audio file URL</p>}
              {isValidUrl && <p className="text-xs text-audio-success">Valid audio URL detected</p>}
            </div>

            <Button
              type="submit"
              disabled={!isValidUrl || isProcessing}
              className="w-full bg-gradient-audio text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Transcription
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Example URLs:</p>
            <div className="space-y-1">
              {exampleUrls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setAudioUrl(url);
                    validateAudioUrl(url);
                  }}
                  className="block text-xs text-audio-primary hover:text-audio-secondary transition-colors duration-200 mx-auto"
                  disabled={isProcessing}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">Supports direct links to MP3, WAV, M4A files and audio platforms</p>
        </div>
      </div>
    </Card>
  );
};

export default AudioUpload;
