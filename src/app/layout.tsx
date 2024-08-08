// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from '@/components/providers';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/navbar';
import Image from "next/image";
import { Toaster } from "react-hot-toast";
export const metadata: Metadata = {
  title: "subx.fun",
};
import { GoogleTagManager,GoogleAnalytics } from '@next/third-parties/google'


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
      <GoogleTagManager gtmId={process.env.GTM_ID!}/>
      <GoogleAnalytics gaId={process.env.GA_ID!} />
      <body>
        <SessionProvider>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <Toaster />
            <div className="flex justify-center my-2">
            <Image src="/icon.png" alt="Icon" width={40} height={40}/>
            <h1 className='mx-1 title font-extrabold text-3xl tracking-tight'>
                INSPILOT
            </h1>
            </div>

            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
