"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Volume2, Globe, Send, Loader2, StopCircle, User, Bot, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";

// Polyfill for SpeechRecognition type
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function VoiceAssistantPage() {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on mount or language change
  useEffect(() => {
    setMessages([
        { role: 'assistant', content: language === 'Hindi' ? "नमस्ते! मैं आपका बाढ़ सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?" : "Hello! I'm your flood assistant. How can I help you today?" }
    ]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
      const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = false; // Stop after one sentence
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

        recognitionRef.current.onstart = () => {
             setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          sendMessage(text);
        };

        recognitionRef.current.onerror = (event: any) => {
             // Silence errors to prevent console spam
             const errorMessage = event.error || 'unknown error';
             setIsListening(false);
             
             if (errorMessage === 'network') {
               setError("Network error. Please check your connection.");
             } else if (errorMessage === 'not-allowed' || errorMessage === 'service-not-allowed') {
               setError("Microphone access denied.");
             } else if (errorMessage === 'no-speech') {
               // specific handler for no speech - often benign
               return; 
             } else {
               setError(`Voice error: ${errorMessage}`);
             }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      synthRef.current = window.speechSynthesis;
    }
  }, [language]);

  const toggleListening = () => {
    setError(null);
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        // Update language before starting
        if(recognitionRef.current) {
            recognitionRef.current.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
        }
        recognitionRef.current?.start();
    }
  };

  const speak = (text: string) => {
    if (synthRef.current && !isMuted) {
      synthRef.current.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      if(language === 'Hindi') {
          utterance.lang = 'hi-IN';
      }
      synthRef.current.speak(utterance);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setTranscript("");
    setError(null);
    setIsLoading(true);

    try {
      // Mock response for now (Groq disabled)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const replyText = language === 'Hindi' 
        ? "मैंने आपको सुना, लेकिन मेरा एआई मस्तिष्क अभी सो रहा है। कृपया बाद में चेक करें!" 
        : "I heard you, but my AI brain is currently sleeping. Please check back later!";
      
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      speak(replyText);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.elements.namedItem('message') as HTMLInputElement;
      if(input.value) {
          sendMessage(input.value);
          input.value = '';
      }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto space-y-4">
      <div className="flex bg-white p-4 rounded-xl shadow-sm border justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("voiceTitle")}</h1>
            <p className="text-sm text-gray-500">
            {t("voiceDesc")}
            </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-blue-600" />}
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white shadow-md border-0">
        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="flex gap-2 flex-row">
                             <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                 <Bot className="h-5 w-5" />
                             </div>
                             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center">
                                <span className="flex gap-1">
                                    <span className="animate-bounce delay-0">.</span>
                                    <span className="animate-bounce delay-150">.</span>
                                    <span className="animate-bounce delay-300">.</span>
                                </span>
                             </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col gap-3">
                 {/* Suggestions */}
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                     <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full" onClick={() => sendMessage(language === 'Hindi' ? "क्या मेरा क्षेत्र सुरक्षित है?" : "Is my area safe?")}>
                        {t("exampleSafe")}
                     </Button>
                     <Button variant="outline" size="sm" className="whitespace-nowrap text-xs rounded-full" onClick={() => sendMessage(language === 'Hindi' ? "जल स्तर बढ़ने की रिपोर्ट करें" : "Report water rising")}>
                        {t("exampleReport")}
                     </Button>
                 </div>

                 <form onSubmit={handleManualSubmit} className="flex gap-2">
                     <Button 
                        type="button" 
                        size="icon" 
                        variant={isListening ? "destructive" : "secondary"}
                        className={`rounded-full h-12 w-12 shrink-0 ${isListening ? 'animate-pulse' : ''}`}
                        onClick={toggleListening}
                     >
                         {isListening ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                     </Button>
                     <Input 
                        name="message" 
                        placeholder={isListening ? t("listening") : t("typeMessage")}
                        className="flex-1 h-12 rounded-full px-6 border-slate-200 focus-visible:ring-blue-500"
                        autoComplete="off"
                     />
                     <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0">
                         <Send className="h-5 w-5" />
                     </Button>
                 </form>
                 <div className="text-center">
                     <p className="text-xs text-slate-400">{t("supportedLanguages")}</p>
                 </div>
            </div>
        </div>
      </Card>
    </div>
  );
}
