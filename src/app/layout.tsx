import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'AI Personalized Learning Path Recommender',
  description: 'Hackathon Prototype featuring Dual-Mode Input, Empathy Engine, and Gatekeeper Reviewer'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 min-h-full flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
