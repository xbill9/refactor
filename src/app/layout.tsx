import type {Metadata} from 'next';
import './globals.css';
// FirebaseClientProvider removed as Firebase SDK is no longer used client-side
// import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'PHP Refactor Pro',
  description: 'Refactor PHP code to be PHP 8.0 compatible with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* FirebaseClientProvider removed */}
        <Navbar />
        <main className="pt-16"> {/* Add padding top to avoid content overlap with fixed Navbar */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
