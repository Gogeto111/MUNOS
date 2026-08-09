"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Square, Volume2, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

export function VoiceAgent() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [textInput, setTextInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await processAudio(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTranscript("");
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Speech recognition failed");
        return;
      }

      const text = data.text;
      setTranscript(text);
      if (text.trim()) {
        await sendToAI(text);
      }
    } catch {
      toast.error("Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToAI = async (text: string) => {
    const userMsg: VoiceMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "AI response failed");
        return;
      }

      const assistantMsg: VoiceMessage = {
        role: "assistant",
        content: data.text,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await speakText(data.text);
    } catch {
      toast.error("Failed to get AI response");
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "TTS failed");
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch {
      toast.error("Failed to play audio");
      setIsSpeaking(false);
    }
  };

  const sendText = async () => {
    if (!textInput.trim() || isProcessing) return;
    const text = textInput.trim();
    setTextInput("");
    await sendToAI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  const reset = () => {
    setMessages([]);
    setTranscript("");
    setTextInput("");
    audioRef.current?.pause();
    setIsSpeaking(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Voice Agent</CardTitle>
        <p className="text-xs text-muted-foreground">
          Speak or type to practice MUN responses with AI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button size="sm" onClick={startRecording} disabled={isProcessing || isSpeaking}>
              <Mic className="mr-1 size-3" />
              Record
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="mr-1 size-3" />
              Stop
            </Button>
          )}
          {isSpeaking && (
            <Button size="sm" variant="outline" onClick={() => audioRef.current?.pause()}>
              <Volume2 className="mr-1 size-3" />
              Stop Speaking
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="size-3" />
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {isRecording && <span className="text-red-500">Recording...</span>}
            {isProcessing && <span>Processing...</span>}
            {isSpeaking && <span className="text-green-500">Speaking...</span>}
          </div>
        </div>

        {transcript && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="text-xs font-medium text-muted-foreground">Last transcript: </span>
            {transcript}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Or type a message..."
            className="min-h-[44px] max-h-[100px] flex-1 resize-none"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            size="icon"
            onClick={sendText}
            disabled={!textInput.trim() || isProcessing}
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>

        {messages.length > 0 && (
          <div className="max-h-[300px] space-y-3 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-muted/50 text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
