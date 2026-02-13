import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { TonConnectProvider } from "@/components/providers/TonConnectProvider";
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Matrix TON",
  description: "Decentralized matrix marketing on TON blockchain",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={inter.className}>
        <AnimatedBackground />
        <div className="stars-bg" />
        <TelegramProvider>
          <TonConnectProvider>
            {children}
          </TonConnectProvider>
        </TelegramProvider>
        <ScrollIndicator />
      </body>
    </html>
  );
}
