'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Restaurant {
    id: string
    name: string
    slug?: string
    currency?: string
    is_master?: boolean
    is_approved?: boolean
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
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const refreshToken = async (): Promise<string | null> => {
        const { data: { session } } = await supabase.auth.getSession()
        const newToken = session?.access_token || null
        setToken(newToken)
        return newToken
    }

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setIsLoading(false)
                return
            }

            setUserId(session.user.id)
            setToken(session.access_token)

            const { data: res } = await supabase
                .from('restaurants')
                .select('id, name, slug, currency, is_master, is_approved')
                .eq('owner_id', session.user.id)
                .single()

            if (res) {
                setRestaurant(res)
            }
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
    }, [])

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
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
