'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface UseRestaurantSettingsParams {
    restaurantId: string | null
    authRestaurant: any
    token: string | null
    refreshRestaurant: () => Promise<void>
}

export function useRestaurantSettings({ restaurantId, authRestaurant, token, refreshRestaurant }: UseRestaurantSettingsParams) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [restaurantName, setRestaurantName] = useState('')
    const [about, setAbout] = useState('')
    const [aboutEn, setAboutEn] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [contactMethod, setContactMethod] = useState<'whatsapp' | 'call' | 'both'>('whatsapp')
    const [currency, setCurrency] = useState('FCFA')
    const [paymentLogic, setPaymentLogic] = useState<'pay_before' | 'pay_after'>('pay_after')
    const [taxRate, setTaxRate] = useState('0')
    const [isTaxIncluded, setIsTaxIncluded] = useState(true)
    const [openingHours, setOpeningHours] = useState<any[]>([])
    const [wifiSsid, setWifiSsid] = useState('')
    const [wifiPassword, setWifiPassword] = useState('')
    const [wifiSecurity, setWifiSecurity] = useState('WPA2')
    const [theme, setTheme] = useState('light')
    const [primaryColor, setPrimaryColor] = useState('#064e3b')
    const [fontFamily, setFontFamily] = useState('font-sans')
    const [headerStyle, setHeaderStyle] = useState('minimal')
    const [instagramUrl, setInstagramUrl] = useState('')
    const [facebookUrl, setFacebookUrl] = useState('')
    const [websiteUrl, setWebsiteUrl] = useState('')
    const [address, setAddress] = useState('')
    const [googleMapsUrl, setGoogleMapsUrl] = useState('')
    const [tiktokUrl, setTiktokUrl] = useState('')
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [isWifiEnabled, setIsWifiEnabled] = useState(true)
    const [isSocialEnabled, setIsSocialEnabled] = useState(true)
    const [isLocationEnabled, setIsLocationEnabled] = useState(true)
    const [isLogoEnabled, setIsLogoEnabled] = useState(true)
    const [logoUrl, setLogoUrl] = useState('')
    const [isInstagramEnabled, setIsInstagramEnabled] = useState(true)
    const [isFacebookEnabled, setIsFacebookEnabled] = useState(true)
    const [isTiktokEnabled, setIsTiktokEnabled] = useState(true)
    const [isYoutubeEnabled, setIsYoutubeEnabled] = useState(true)
    const [isWebsiteEnabled, setIsWebsiteEnabled] = useState(true)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    useEffect(() => {
        if (!authRestaurant) return

        setRestaurantName(authRestaurant.name || '')
        setAbout(authRestaurant.about || '')
        setAboutEn(authRestaurant.about_en || '')
        setWhatsappNumber(authRestaurant.whatsapp_number || '')
        setPhoneNumber(authRestaurant.phone_number || '')
        setContactMethod((authRestaurant.contact_method as 'whatsapp' | 'call' | 'both') || 'whatsapp')
        setCurrency(authRestaurant.currency || 'FCFA')
        setPaymentLogic((authRestaurant.payment_logic as 'pay_before' | 'pay_after') || 'pay_after')
        setTaxRate(authRestaurant.tax_rate?.toString() || '0')
        setIsTaxIncluded(authRestaurant.is_tax_included !== false)

        const defaultHours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => ({
            day,
            hours: '09:00 - 22:00',
            isOpen: true
        }))
        setOpeningHours(authRestaurant.opening_hours?.length > 0 ? authRestaurant.opening_hours : defaultHours)

        setWifiSsid(authRestaurant.wifi_ssid || '')
        setWifiPassword(authRestaurant.wifi_password || '')
        setWifiSecurity(authRestaurant.wifi_security || 'WPA2')
        setTheme(authRestaurant.theme || 'light')
        setPrimaryColor(authRestaurant.primary_color || '#064e3b')
        setFontFamily(authRestaurant.font_family || 'font-sans')
        setHeaderStyle(authRestaurant.header_style || 'minimal')
        setInstagramUrl(authRestaurant.instagram_url || '')
        setFacebookUrl(authRestaurant.facebook_url || '')
        setWebsiteUrl(authRestaurant.website_url || '')
        setAddress(authRestaurant.address || '')
        setGoogleMapsUrl(authRestaurant.google_maps_url || '')
        setTiktokUrl(authRestaurant.tiktok_url || '')
        setYoutubeUrl(authRestaurant.youtube_url || '')
        setIsWifiEnabled(authRestaurant.is_wifi_enabled !== false)
        setIsSocialEnabled(authRestaurant.is_social_enabled !== false)
        setIsLocationEnabled(authRestaurant.is_location_enabled !== false)
        setIsLogoEnabled(authRestaurant.is_logo_enabled !== false)
        setLogoUrl(authRestaurant.logo_url || '')
        setIsInstagramEnabled(authRestaurant.is_instagram_enabled !== false)
        setIsFacebookEnabled(authRestaurant.is_facebook_enabled !== false)
        setIsTiktokEnabled(authRestaurant.is_tiktok_enabled !== false)
        setIsYoutubeEnabled(authRestaurant.is_youtube_enabled !== false)
        setIsWebsiteEnabled(authRestaurant.is_website_enabled !== false)
        setLoading(false)
    }, [authRestaurant])

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingLogo(true)
            if (!e.target.files || e.target.files.length === 0) {
                setUploadingLogo(false)
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${restaurantId}/logo-${Date.now()}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { cacheControl: '3600', upsert: false })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            setLogoUrl(publicUrl)
            toast.success('Logo mis a jour !')
        } catch (error: any) {
            toast.error('Erreur lors de l\'upload du logo: ' + error.message)
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId) return
        setSaving(true)

        try {
            const info = {
                name: restaurantName,
                about: about,
                about_en: aboutEn,
                whatsapp_number: whatsappNumber,
                phone_number: phoneNumber,
                contact_method: contactMethod,
                currency: currency,
                payment_logic: paymentLogic,
                tax_rate: parseFloat(taxRate) || 0,
                is_tax_included: isTaxIncluded,
                opening_hours: openingHours,
                wifi_ssid: wifiSsid,
                wifi_password: wifiPassword,
                wifi_security: wifiSecurity,
                theme: theme,
                primary_color: primaryColor,
                font_family: fontFamily,
                header_style: headerStyle,
                instagram_url: instagramUrl,
                facebook_url: facebookUrl,
                website_url: websiteUrl,
                address: address,
                google_maps_url: googleMapsUrl,
                tiktok_url: tiktokUrl,
                youtube_url: youtubeUrl,
                is_wifi_enabled: isWifiEnabled,
                is_social_enabled: isSocialEnabled,
                is_location_enabled: isLocationEnabled,
                is_logo_enabled: isLogoEnabled,
                logo_url: logoUrl,
                is_instagram_enabled: isInstagramEnabled,
                is_facebook_enabled: isFacebookEnabled,
                is_tiktok_enabled: isTiktokEnabled,
                is_youtube_enabled: isYoutubeEnabled,
                is_website_enabled: isWebsiteEnabled
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/settings/${restaurantId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(info)
            })

            if (!res.ok) throw new Error('Echec de la sauvegarde')
            await refreshRestaurant()
            toast.success('Reglages enregistres !')
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l\'enregistrement')
        } finally {
            setSaving(false)
        }
    }

    return {
        loading,
        saving,
        handleSave,
        handleUploadLogo,
        uploadingLogo,
        // General info
        restaurantName, setRestaurantName,
        about, setAbout,
        aboutEn, setAboutEn,
        whatsappNumber, setWhatsappNumber,
        phoneNumber, setPhoneNumber,
        contactMethod, setContactMethod,
        // Payment & currency
        currency, setCurrency,
        paymentLogic, setPaymentLogic,
        taxRate, setTaxRate,
        isTaxIncluded, setIsTaxIncluded,
        // Opening hours
        openingHours, setOpeningHours,
        // WiFi
        wifiSsid, setWifiSsid,
        wifiPassword, setWifiPassword,
        wifiSecurity, setWifiSecurity,
        isWifiEnabled, setIsWifiEnabled,
        // Theme & branding
        theme, setTheme,
        primaryColor, setPrimaryColor,
        fontFamily, setFontFamily,
        headerStyle, setHeaderStyle,
        isLogoEnabled, setIsLogoEnabled,
        logoUrl, setLogoUrl,
        // Social
        instagramUrl, setInstagramUrl,
        facebookUrl, setFacebookUrl,
        websiteUrl, setWebsiteUrl,
        tiktokUrl, setTiktokUrl,
        youtubeUrl, setYoutubeUrl,
        isSocialEnabled, setIsSocialEnabled,
        isInstagramEnabled, setIsInstagramEnabled,
        isFacebookEnabled, setIsFacebookEnabled,
        isTiktokEnabled, setIsTiktokEnabled,
        isYoutubeEnabled, setIsYoutubeEnabled,
        isWebsiteEnabled, setIsWebsiteEnabled,
        // Location
        address, setAddress,
        googleMapsUrl, setGoogleMapsUrl,
        isLocationEnabled, setIsLocationEnabled,
    }
}
