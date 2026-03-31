import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import { RiverTheme } from "@/components/RiverTheme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaGuardians | AI-Powered River Protection",
  description: "AI-powered flood monitoring, prediction, and community engagement platform for the Ganga River corridor",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AquaGuardians",
  },
};

export const viewport: Viewport = {
  themeColor: "#006DC4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <RiverTheme />
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
