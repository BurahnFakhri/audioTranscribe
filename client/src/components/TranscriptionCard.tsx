// src/components/TranscriptionCard.tsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileAudio, Copy, Download, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { cn } from "@/lib/utils";
import type { TranscriptionRecordType } from "@/lib/api";

export type TranscriptionRecord = TranscriptionRecordType;

interface Props {
  record: TranscriptionRecord;
}

const getStatusConfig = (status: TranscriptionRecord["status"]) => {
  switch (status) {
    case "pending":
      return { icon: Clock, color: "bg-status-pending text-foreground border-status-pending", label: "Pending", description: "Waiting to be processed" };
    case "processing":
      return { icon: Loader2, color: "bg-status-processing text-white border-status-processing", label: "Processing", description: "Transcribing audio...", animate: true };
    case "completed":
      return { icon: CheckCircle, color: "bg-status-completed text-white border-status-completed", label: "Completed", description: "Transcription ready" };
    case "failed":
      return { icon: AlertCircle, color: "bg-status-failed text-white border-status-failed", label: "Failed", description: "Transcription failed" };
  }
};

const TranscriptionCard: React.FC<Props> = ({ record }) => {
  const [copied, setCopied] = useState(false);
  const statusConfig = getStatusConfig(record.status)!;
  const StatusIcon = statusConfig.icon as any;

  const handleCopy = async () => {
    if (!record.transcription) return;
    try {
      await navigator.clipboard.writeText(record.transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      if(err instanceof Error) {
        console.log(err.message)
      }
    }
  };

  const handleExport = () => {
    const text = record.transcription ?? "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (`transcription-${record._id}`).replace(/\s+/g, "-");
    a.download = `${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const formatDateToDDMMYYYY = (dateInput: Date | string): string => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 → 12

    const formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

    return `${day}-${month}-${year} ${formattedTime}`;
  }

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-lg animate-slide-up">
      <style>{`
        /* Root container class: .audio-player-custom */
        .audio-player-custom .rhap_play-pause-button svg,
        .audio-player-custom .rhap_volume .rhap_volume-button svg {
          color: #1593EB !important;
          fill: #1593EB !important;
        }

        .audio-player-custom .rhap_play-pause-button,
        .audio-player-custom .rhap_volume .rhap_volume-button {
          /* ensure the icon container doesn't override the color */
          color: #1593EB !important;
        }

        .audio-player-custom .rhap_progress-filled {
          background: #1593EB !important;
        }

        .audio-player-custom .rhap_progress-indicator {
          background: #1593EB !important;
          box-shadow: 0 0 0 4px rgba(21,147,235,0.12);
        }

        .audio-player-custom .rhap_seek-bar {
          background: rgba(21,147,235,0.08) !important;
        }

        .audio-player-custom .rhap_volume-bar .rhap_volume-level {
          background: #1593EB !important;
        }

        /* small tweak for the main control color if library uses SVG strokes */
        .audio-player-custom .rhap_play-pause-button svg path {
          stroke: #1593EB !important;
          fill: #1593EB !important;
        }
      `}</style>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-audio">
              <FileAudio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{record.audioUrl}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDateToDDMMYYYY(record.createdAt)}</span>
                {record.attempts > 1 ? (
                  <>
                    <span>•</span>
                    <span>{record.attempts} attempts</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <Badge className={cn("flex items-center gap-1.5 px-3 py-1 text-xs font-medium border", statusConfig.color)}>
            <StatusIcon className={cn("h-3 w-3", statusConfig.animate && "animate-spin")} />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Audio Player */}
        {record.status === "completed" && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            {/* add className so our scoped CSS affects the player */}
            <AudioPlayer
              autoPlay={false}
              src={record.audioUrl}
              layout={"horizontal-reverse"}
              showFilledVolume={false}
              showSkipControls={false}
              loop={false}
              className="audio-player-custom"
            />
          </div>
        )}

        {/* Status description */}
        <p className="text-sm text-muted-foreground">{statusConfig.description}</p>

        {/* Error */}
        {record.error && record.status === "failed" && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{record.error}</p>
          </div>
        )}

        {/* Transcription area */}
        {record.transcription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Transcription</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-3 text-xs hover:bg-accent">
                  <Copy className="mr-1 h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExport} className="h-8 px-3 text-xs hover:bg-accent">
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>

            <Textarea value={record.transcription} readOnly className="min-h-[120px] resize-none bg-muted/50 text-sm leading-relaxed" />
          </div>
        )}

        {/* Processing animation */}
        {record.status === "processing" && (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-1 bg-gradient-audio rounded-full animate-wave" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TranscriptionCard;