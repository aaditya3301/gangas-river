"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export default function VoiceAssistantPage() {
  const { language } = useLanguage();

  const isHindi = language === "Hindi";
  const greeting = isHindi
    ? "नमस्ते। मैं आपकी बाढ़ सुरक्षा सहायक हूँ।"
    : "Hello. I am your flood safety assistant.";

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-155 flex-col gap-4">
      <PageHeader
        title="Chat Assistant"
        description="Use voice or text to get flood safety help"
        icon={MessageCircle}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        actions={
          <Link href="/citizen/assistant">
            <Button variant="outline" size="sm">Open Full Assistant</Button>
          </Link>
        }
      />

      <div className="flex-1 min-h-0">
        <VoiceAssistant language={isHindi ? "hi-IN" : "en-US"} initialGreeting={greeting} />
      </div>
    </div>
  );
}
