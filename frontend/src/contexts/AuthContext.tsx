'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface Restaurant {
    id: string
    name: string
    slug?: string
    currency?: string
    is_master?: boolean
    is_approved?: boolean
    about?: string
    about_en?: string
    whatsapp_number?: string
    phone_number?: string
    contact_method?: string
    payment_logic?: string
    tax_rate?: number
    is_tax_included?: boolean
    opening_hours?: any
    wifi_ssid?: string
    wifi_password?: string
    wifi_security?: string
    theme?: string
    primary_color?: string
    font_family?: string
    header_style?: string
    instagram_url?: string
    facebook_url?: string
    website_url?: string
    address?: string
    google_maps_url?: string
    tiktok_url?: string
    youtube_url?: string
    is_wifi_enabled?: boolean
    is_social_enabled?: boolean
    is_location_enabled?: boolean
    is_logo_enabled?: boolean
    logo_url?: string
    is_instagram_enabled?: boolean
    is_facebook_enabled?: boolean
    is_tiktok_enabled?: boolean
    is_youtube_enabled?: boolean
    is_website_enabled?: boolean
    qr_settings?: any
    [key: string]: any
}

interface AuthContextType {
    userId: string | null
    restaurantId: string | null
    restaurant: Restaurant | null
    isMaster: boolean
    isApproved: boolean
    isLoading: boolean
    token: string | null
    refreshToken: () => Promise<string | null>
    refreshRestaurant: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    userId: null,
    restaurantId: null,
    restaurant: null,
    isMaster: false,
    isApproved: true,
    isLoading: true,
    token: null,
    refreshToken: async () => null,
    refreshRestaurant: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const refreshToken = async (): Promise<string | null> => {
        const { data: { session } } = await supabase.auth.getSession()
        const newToken = session?.access_token || null
        setToken(newToken)
        return newToken
    }

    const fetchRestaurant = useCallback(async (ownerId: string) => {
        const { data: res } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', ownerId)
            .single()
        if (res) setRestaurant(res)
    }, [])

    const refreshRestaurant = useCallback(async () => {
        if (userId) await fetchRestaurant(userId)
    }, [userId, fetchRestaurant])

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setIsLoading(false)
                return
            }

            setUserId(session.user.id)
            setToken(session.access_token)
            await fetchRestaurant(session.user.id)
            setIsLoading(false)
        }

        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUserId(null)
                setRestaurant(null)
                setToken(null)
            } else if (session) {
                setUserId(session.user.id)
                setToken(session.access_token)
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchRestaurant])

    return (
        <AuthContext.Provider value={{
            userId,
            restaurantId: restaurant?.id || null,
            restaurant,
            isMaster: restaurant?.is_master || false,
            isApproved: restaurant?.is_approved !== false,
            isLoading,
            token,
            refreshToken,
            refreshRestaurant,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
