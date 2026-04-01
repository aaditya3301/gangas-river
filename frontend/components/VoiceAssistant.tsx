"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Mic, MicOff, Send, User, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatAPI } from "@/lib/api";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface VoiceAssistantProps {
  initialGreeting?: string;
  language?: "en-IN" | "hi-IN";
}

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function VoiceAssistant({
  initialGreeting = "Hello. I can help with flood safety, nearby shelters, and live reports.",
  language = "en-IN",
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialGreeting },
  ]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  const hasSpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  }, []);

  const hasSpeechSynthesis = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return "speechSynthesis" in window;
  }, []);

  useEffect(() => {
    setMessages([{ role: "assistant", content: initialGreeting }]);
  }, [initialGreeting]);

  useEffect(() => {
    if (!scrollEndRef.current) {
      return;
    }
    scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (!hasSpeechRecognition || typeof window === "undefined") {
      return;
    }

    const speechWindow = window as SpeechWindow;
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);

      if (current.isFinal) {
        void sendMessageRef.current(text);
      }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error("Microphone access denied.");
        return;
      }
      if (event.error === "no-speech") {
        return;
      }
      toast.error(`Voice input error: ${event.error}`);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [hasSpeechRecognition, language]);

  const speak = useCallback(
    (text: string) => {
      if (!hasSpeechSynthesis || !voiceEnabled || typeof window === "undefined") {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [hasSpeechSynthesis, voiceEnabled, language]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) {
        return;
      }

      const history = messages.slice(-10);
      setMessages((prev) => [...prev, { role: "user", content: clean }]);
      setTranscript("");
      setInputValue("");
      setIsProcessing(true);

      try {
        const response = await chatAPI.send({
          message: clean,
          history,
        });

        const reply = response.response || response.reply || "I am unable to answer right now.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        speak(reply);
      } catch (error: unknown) {
        const fallback = "Sorry, I am unable to connect right now. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
        toast.error(getErrorMessage(error, "Assistant request failed"));
      } finally {
        setIsProcessing(false);
      }
    },
    [messages, speak]
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(inputValue);
  };

  const toggleListening = () => {
    if (!hasSpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    recognitionRef.current?.start();
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex h-full min-h-140 flex-col rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <p className="text-sm text-slate-500">
          Ask about flood safety, latest incidents, and nearest shelters. Supports English and Hindi.
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-slate-400">
              <MessageCircle className="mx-auto mb-3 h-10 w-10" />
              Start by typing a message or tapping the microphone.
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[90%] gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full ${message.role === "user" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800"}`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          )}

          {transcript && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Live transcript: &quot;{transcript}&quot;
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>
      </ScrollArea>

      {!hasSpeechRecognition && (
        <div className="border-t bg-amber-50 px-4 py-2 text-xs text-amber-700">
          This browser does not support voice-to-text. You can still use text chat below.
        </div>
      )}

      <div className="border-t p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void sendMessage("Is my area safe today?")}>Is my area safe?</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void sendMessage("Find nearest safe shelter route")}>Find nearest shelter</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void sendMessage("How to report flooding?")}>How to report flooding?</Button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant={isListening ? "destructive" : "secondary"}
            className={`h-11 w-11 rounded-full ${isListening ? "animate-pulse" : ""}`}
            onClick={toggleListening}
            disabled={!hasSpeechRecognition || isProcessing}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={isListening ? "Listening..." : "Type your question"}
            className="h-11"
            autoComplete="off"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              }
              setVoiceEnabled((prev) => !prev);
            }}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>

          <Button type="submit" size="icon" className="h-11 w-11 rounded-full" disabled={isProcessing || !inputValue.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
