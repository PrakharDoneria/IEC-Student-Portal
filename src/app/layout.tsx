import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/app-header';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'IEC Student Portal',
  description: 'View your attendance summary.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased', ptSans.variable)}>
        <div className="flex flex-col min-h-screen bg-background">
          <AppHeader />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
