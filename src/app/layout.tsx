// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from '@/components/providers';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/navbar';
import Image from "next/image";
export const metadata: Metadata = {
  title: "Inspilot",
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <Image src="/icon.png" alt="Icon" width={56} height={56} className="mx-auto my-4"/>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
