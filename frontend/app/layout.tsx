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
        <script
          dangerouslySetInnerHTML={{
            __html: `
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = function() { eruda.init(); };
    document.head.appendChild(script);
  })();
`,
          }}
        />
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
