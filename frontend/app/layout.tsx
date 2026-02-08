import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matrix TON",
  description: "Decentralized matrix marketing on TON blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnimatedBackground />
        <div className="stars-bg" />
        <TelegramProvider>
          {children}
        </TelegramProvider>
        <ScrollIndicator />
      </body>
    </html>
  );
}
