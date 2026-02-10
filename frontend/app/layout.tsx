import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

const inter = Inter({
  variable: "--font-geist-sans",
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
        className={`${inter.variable} antialiased`}
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
