import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nore Menu - Premium Digital Experience',
    short_name: 'Nore Menu',
    description: 'Luxury digital menus for premium restaurants.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfcfb',
    theme_color: '#064e3b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
