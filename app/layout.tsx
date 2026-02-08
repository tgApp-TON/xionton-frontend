import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/TelegramProvider";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matrix TON",
  description: "Automatic Matrix System on TON Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
