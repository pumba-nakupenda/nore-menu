import { Metadata, ResolvingMetadata } from 'next'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  // Fetch restaurant data from Supabase
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, logo_url, about')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single()

  if (!restaurant) {
    return {
      title: 'Menu Introuvable - Nore Menu',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${restaurant.name} - Menu Digital`,
    description: restaurant.about || `Découvrez la carte de ${restaurant.name} sur Nore Menu.`,
    openGraph: {
      title: `${restaurant.name} | Expérience Gastronomique Digitale`,
      description: restaurant.about || `Scannez pour commander et découvrir nos spécialités.`,
      url: `https://noremenu.com/menu/${id}`,
      siteName: 'Nore Menu',
      images: [
        restaurant.logo_url || 'https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-512.png',
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} - Menu Digital`,
      description: `Découvrez notre carte en ligne.`,
      images: [restaurant.logo_url || 'https://etcmxirpubasziepirdy.supabase.co/storage/v1/object/public/logos/pwa-icon-512.png'],
    },
  }
}

export default function RestaurantLayout({ children }: Props) {
  return <>{children}</>
}
