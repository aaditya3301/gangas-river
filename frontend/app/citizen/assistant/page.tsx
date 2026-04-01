"use client";

import { MessageCircle } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useLanguage } from "@/lib/language-context";

export default function AssistantPage() {
  const { language } = useLanguage();

  const isHindi = language === "Hindi";
  const greeting = isHindi
    ? "नमस्ते। मैं आपकी बाढ़ सुरक्षा सहायक हूँ। आप सुरक्षित मार्ग, रिपोर्ट, और वर्तमान स्थिति के बारे में पूछ सकते हैं।"
    : "Hello. I am your flood safety assistant. Ask about safe routes, incident reports, and current conditions.";

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-155 flex-col gap-4">
      <PageHeader
        title="Chat Assistant"
        description="Ask about flood risks, reports, and evacuation guidance"
        icon={MessageCircle}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
      />

      <div className="flex-1 min-h-0">
        <VoiceAssistant language={isHindi ? "hi-IN" : "en-US"} initialGreeting={greeting} />
      </div>
    </div>
  );
}
