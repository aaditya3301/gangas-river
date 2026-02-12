"use client";

import { LanguageProvider } from "@/lib/language-context";
import CitizenLayoutContent from "./layout-content";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <CitizenLayoutContent>
        {children}
      </CitizenLayoutContent>
    </LanguageProvider>
  );
}
