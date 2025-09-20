// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import AudioUpload from "@/components/AudioUpload";
import TranscriptionCard, { type TranscriptionRecord } from "@/components/TranscriptionCard";
import { fetchTranscriptions, createTranscription } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Settings, Zap, RefreshCw, Loader2 } from "lucide-react"; // <-- added RefreshCw, Loader2
import { toast } from "sonner";

const Index: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTranscriptions = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchTranscriptions(signal);
      if (resp.success) {
        setTranscriptions(resp.data.items);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load transcriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    loadTranscriptions(ctrl.signal);
    return () => {
      ctrl.abort();
    };
  }, []);

  const handleUrlSubmit = async (audioUrl: string) => {
    if (!audioUrl) return;
    setIsProcessing(true);
    setError(null);

    try {
      // call API to create transcription
      const response = await createTranscription(audioUrl);
      if (response.success) {
        toast("Success", {
          description: "Request of transcription has added it will be trancribed shortly.",
          duration: 6000,
          action: {
            label: "x",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      } else {
        toast("Error", {
          description: response.error || "Something went wrong",
          duration: 6000,
          action: {
            label: "x",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      }

      // after creation refetch list (simple approach)
      await loadTranscriptions();
      setActiveTab("transcriptions");
    } catch (err: any) {
      setError(err.message || "Failed to create transcription");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-audio">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AudioScribe</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Audio Transcription</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button className="gap-2 bg-gradient-audio text-white hover:opacity-90">
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="gap-2">
              <Mic className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="transcriptions" className="gap-2">
              <FileText className="h-4 w-4" />
              Transcriptions
              {transcriptions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {transcriptions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Transform Audio to Text</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Paste your audio file URL and get accurate transcriptions powered by advanced AI technology.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <AudioUpload onSubmit={handleUrlSubmit} isProcessing={isProcessing} />
            </div>
          </TabsContent>

          {/* Transcriptions Tab */}
          <TabsContent value="transcriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Transcriptions</h2>
                <p className="text-muted-foreground">Manage and review your audio transcriptions</p>
              </div>

              {/* REFRESH BUTTON: top-right of the Transcriptions header */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadTranscriptions()}
                  disabled={loading}
                  aria-label="Refresh transcriptions"
                  title="Refresh"
                  className="h-9 w-9 p-2"
                >
                  {loading ? (
                    // small spinner icon while loading
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {loading ? (
              <Card className="p-8 text-center">Loading…</Card>
            ) : error ? (
              <Card className="p-6 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <div className="flex justify-center">
                  <Button onClick={() => loadTranscriptions()} className="gap-2">
                    Retry
                  </Button>
                </div>
              </Card>
            ) : transcriptions.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="font-semibold mb-2">No transcriptions yet</h3>
                <p className="text-muted-foreground mb-4">Add your first audio URL to get started</p>
                <Button onClick={() => setActiveTab("upload")} className="gap-2">
                  <Mic className="h-4 w-4" />
                  Add Audio URL
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {transcriptions && transcriptions.map((record) => (
                  <TranscriptionCard key={record._id} record={record} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;