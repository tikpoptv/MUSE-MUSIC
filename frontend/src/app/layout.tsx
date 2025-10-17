import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import SetupRedirect from "../components/SetupRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://muse-music.example.com'),
  title: {
    default: 'MUSE MUSIC',
    template: '%s | MUSE MUSIC',
  },
  description: 'Discover lyrics meanings, moods, and translations — MUSE MUSIC',
  keywords: ['music', 'lyrics', 'mood analysis', 'translation', 'MUSE MUSIC'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://muse-music.example.com',
    title: 'MUSE MUSIC',
    description: 'Discover lyrics meanings, moods, and translations — MUSE MUSIC',
    siteName: 'MUSE MUSIC',
    images: [
      {
        url: '/images/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'MUSE MUSIC',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MUSE MUSIC',
    description: 'Discover lyrics meanings, moods, and translations — MUSE MUSIC',
    images: ['/images/cover.jpg'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SetupRedirect />
        <Navbar />
        {children}
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
