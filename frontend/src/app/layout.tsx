import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Cormorant_Garamond, Montserrat } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nore Menu - Premium Digital Experience",
  description: "Luxury digital menus for premium restaurants. Elevate your guest experience with contactless ordering.",
  manifest: '/manifest.json',
  metadataBase: new URL('https://noremenu.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://noremenu.com',
    title: 'Nore Menu - L’Excellence Digitale en Restauration',
    description: 'Créez un menu digital luxueux pour votre établissement. Commande WhatsApp, gestion de table et design premium.',
    siteName: 'Nore Menu',
    images: [
      {
        url: 'https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-512.png',
        width: 512,
        height: 512,
        alt: 'Nore Menu Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nore Menu - Premium Digital Experience',
    description: 'Contactless digital menus for high-end restaurants.',
    images: ['https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Nore Menu",
  },
};

export const viewport = {
  themeColor: '#064e3b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${montserrat.variable} antialiased`}
      >
        <SmoothScroll>
          <Toaster position="top-center" richColors />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
