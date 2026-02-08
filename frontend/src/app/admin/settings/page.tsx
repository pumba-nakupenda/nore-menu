'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Save, RefreshCw, Palette, Check, Wifi, Shield, Lock, MessageSquare, Globe, Instagram, Facebook, MapPin, Compass, Youtube, Music, Upload, Loader2, Smartphone, Sparkles, Clock, Coins, Percent, Utensils, History } from 'lucide-react'

export default function SettingsPage() {
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

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
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: restaurant, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .single()

            if (error || !restaurant) {
                router.push('/admin/onboarding')
                return
            }

            setRestaurantId(restaurant.id)
            setRestaurantName(restaurant.name || '')
            setAbout(restaurant.about || '')
            setAboutEn(restaurant.about_en || '')
            setWhatsappNumber(restaurant.whatsapp_number || '')
            setPhoneNumber(restaurant.phone_number || '')
            setContactMethod(restaurant.contact_method || 'whatsapp')
            setCurrency(restaurant.currency || 'FCFA')
            setPaymentLogic(restaurant.payment_logic || 'pay_after')
            setTaxRate(restaurant.tax_rate?.toString() || '0')
            setIsTaxIncluded(restaurant.is_tax_included !== false)
            
            const defaultHours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => ({
                day,
                hours: '09:00 - 22:00',
                isOpen: true
            }))
            setOpeningHours(restaurant.opening_hours?.length > 0 ? restaurant.opening_hours : defaultHours)
            
            setWifiSsid(restaurant.wifi_ssid || '')
            setWifiPassword(restaurant.wifi_password || '')
            setWifiSecurity(restaurant.wifi_security || 'WPA2')
            setTheme(restaurant.theme || 'light')
            setPrimaryColor(restaurant.primary_color || '#064e3b')
            setFontFamily(restaurant.font_family || 'font-sans')
            setHeaderStyle(restaurant.header_style || 'minimal')
            setInstagramUrl(restaurant.instagram_url || '')
            setFacebookUrl(restaurant.facebook_url || '')
            setWebsiteUrl(restaurant.website_url || '')
            setAddress(restaurant.address || '')
            setGoogleMapsUrl(restaurant.google_maps_url || '')
            setTiktokUrl(restaurant.tiktok_url || '')
            setYoutubeUrl(restaurant.youtube_url || '')
            setIsWifiEnabled(restaurant.is_wifi_enabled !== false)
            setIsSocialEnabled(restaurant.is_social_enabled !== false)
            setIsLocationEnabled(restaurant.is_location_enabled !== false)
            setIsLogoEnabled(restaurant.is_logo_enabled !== false)
            setLogoUrl(restaurant.logo_url || '')
            setIsInstagramEnabled(restaurant.is_instagram_enabled !== false)
            setIsFacebookEnabled(restaurant.is_facebook_enabled !== false)
            setIsTiktokEnabled(restaurant.is_tiktok_enabled !== false)
            setIsYoutubeEnabled(restaurant.is_youtube_enabled !== false)
            setIsWebsiteEnabled(restaurant.is_website_enabled !== false)
            setLoading(false)
        }
        init()
    }, [router])

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
            toast.success('✅ Logo uploadé avec succès!')
        } catch (error: any) {
            toast.error('Error uploading logo: ' + error.message)
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId) return
        setSaving(true)

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token

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

            if (!res.ok) throw new Error('Failed to save settings')
            toast.success('Settings saved successfully! ✨')
        } catch (err: any) {
            toast.error(err.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
            <p className="font-medium animate-pulse">Loading settings...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="mb-8">
                <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Restaurant Settings</h2>
                <p className="text-zinc-500 mt-2 text-lg">Manage your restaurant info and public menu appearance.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* RESTAURANT INFO SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Globe className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <h3>Restaurant Information</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Restaurant Name</label>
                            <input
                                type="text"
                                value={restaurantName}
                                onChange={(e) => setRestaurantName(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-zinc-900 font-bold shadow-sm"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">À propos (FR)</label>
                                <textarea
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-medium min-h-[100px] shadow-sm"
                                    placeholder="L'histoire de votre restaurant..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">About Us (EN)</label>
                                <textarea
                                    value={aboutEn}
                                    onChange={(e) => setAboutEn(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-medium min-h-[100px] shadow-sm"
                                    placeholder="Your restaurant's story..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-black/5 grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                    <Coins className="w-4 h-4 text-[#c5a059]" /> Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold shadow-sm cursor-pointer"
                                >
                                    <option value="FCFA">FCFA (XOF)</option>
                                    <option value="€">Euro (€)</option>
                                    <option value="$">Dollar ($)</option>
                                    <option value="£">Pound (£)</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                                    <Percent className="w-4 h-4 text-[#c5a059]" /> Tax Rate (%)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold shadow-sm"
                                        placeholder="0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsTaxIncluded(!isTaxIncluded)}
                                        className={`shrink-0 px-4 py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${isTaxIncluded ? 'border-[#064e3b] bg-[#064e3b] text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                                    >
                                        {isTaxIncluded ? 'Inc.' : 'Excl.'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTACT METHODS SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <MessageSquare className="w-5 h-5 mr-3 text-emerald-600" />
                        <h3>Contact Methods</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setContactMethod('whatsapp')}
                                className={`p-4 rounded-2xl border-2 transition-all text-center ${contactMethod === 'whatsapp' ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-200 bg-zinc-50'}`}
                            >
                                <MessageSquare className={`w-6 h-6 mx-auto mb-2 ${contactMethod === 'whatsapp' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                                <p className="text-xs font-bold">WhatsApp</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactMethod('call')}
                                className={`p-4 rounded-2xl border-2 transition-all text-center ${contactMethod === 'call' ? 'border-blue-600 bg-blue-50' : 'border-zinc-200 bg-zinc-50'}`}
                            >
                                <Smartphone className={`w-6 h-6 mx-auto mb-2 ${contactMethod === 'call' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                <p className="text-xs font-bold">Call</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactMethod('both')}
                                className={`p-4 rounded-2xl border-2 transition-all text-center ${contactMethod === 'both' ? 'border-purple-600 bg-purple-50' : 'border-zinc-200 bg-zinc-50'}`}
                            >
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <MessageSquare className={`w-5 h-5 ${contactMethod === 'both' ? 'text-purple-600' : 'text-zinc-400'}`} />
                                    <Smartphone className={`w-5 h-5 ${contactMethod === 'both' ? 'text-purple-600' : 'text-zinc-400'}`} />
                                </div>
                                <p className="text-xs font-bold">Both</p>
                            </button>
                        </div>

                        {(contactMethod === 'whatsapp' || contactMethod === 'both') && (
                            <input
                                type="text"
                                placeholder="WhatsApp Number (+221...)"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white outline-none text-zinc-900 font-bold"
                            />
                        )}

                        {(contactMethod === 'call' || contactMethod === 'both') && (
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white outline-none text-zinc-900 font-bold"
                            />
                        )}
                    </div>
                </div>

                {/* THEME SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Palette className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <h3>Public Menu Theme</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'light', name: 'Emerald White', desc: 'Clair & Épuré', color: '#064e3b' },
                            { id: 'dark', name: 'Onyx Green', desc: 'Sombre & Luxueux', color: '#10b981' },
                            { id: 'neutral', name: 'Warm Ivory', desc: 'Doux & Chaleureux', color: '#c5a059' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTheme(t.id)}
                                className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${theme === t.id
                                    ? 'border-[#064e3b] bg-emerald-50/30'
                                    : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                            >
                                <div className="flex flex-col gap-3">
                                    <div className={`w-12 h-12 rounded-2xl ${t.id === 'dark' ? 'bg-[#053e2f]' : 'bg-white'} border border-black/5 shadow-sm flex items-center justify-center`}>
                                        <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                                    </div>
                                    <div>
                                        <p className="font-black text-zinc-900 text-[11px] uppercase tracking-wider italic">{t.name}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{t.desc}</p>
                                    </div>
                                </div>
                                {theme === t.id && (
                                    <div className="absolute top-4 right-4 bg-[#064e3b] text-white p-1 rounded-full shadow-lg">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-black/5">
                        <div className="flex items-center mb-6">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-[#064e3b] mr-3 border border-emerald-100">
                                <Palette className="w-4 h-4" />
                            </div>
                            <h4 className="font-black text-[10px] text-zinc-900 uppercase tracking-[0.2em]">Charte Graphique</h4>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className="relative group shrink-0">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-24 h-24 rounded-[2rem] cursor-pointer border-4 border-white shadow-xl appearance-none bg-transparent overflow-hidden"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-zinc-700">Couleur Primaire</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={primaryColor.toUpperCase()}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-32 px-4 py-2.5 rounded-xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-600 font-mono text-xs font-bold shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['#064e3b', '#c5a059', '#10b981', '#f59e0b', '#ef4444', '#1e293b'].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setPrimaryColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === color ? 'border-zinc-900 scale-110 shadow-lg' : 'border-white hover:scale-110 shadow-sm'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREMIUM CUSTOMIZATION SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Palette className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <h3>Premium Customization</h3>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 ml-1">Police d'écriture (Font)</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'font-sans', name: 'Moderne', desc: 'Inter / Sans', sample: 'Aa' },
                                    { id: 'font-serif', name: 'Luxe', desc: 'Playfair / Serif', sample: 'Aa' },
                                    { id: 'font-classic', name: 'Classique', desc: 'Cormorant / Garamond', sample: 'Aa' },
                                    { id: 'font-geometric', name: 'Géo', desc: 'Montserrat / Geometric', sample: 'Aa' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setFontFamily(f.id)}
                                        className={`p-5 rounded-2xl border-2 transition-all text-center relative ${fontFamily === f.id ? 'border-[#064e3b] bg-emerald-50/30 shadow-sm' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                                    >
                                        <span className={`text-4xl block mb-2 ${f.id} text-[#064e3b]`}>{f.sample}</span>
                                        <p className="font-black text-[10px] uppercase tracking-tight text-zinc-900">{f.name}</p>
                                        {fontFamily === f.id && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-[#064e3b] text-white rounded-full"><Check className="w-3 h-3" /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 ml-1">Style d'En-tête (Header)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'minimal', name: 'Minimal', color: 'bg-zinc-100' },
                                    { id: 'glassmorphism', name: 'Glass', color: 'bg-emerald-100/30 backdrop-blur-md' },
                                    { id: 'gradient', name: 'Gradient', color: 'bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-20' }
                                ].map(h => (
                                    <button
                                        key={h.id}
                                        type="button"
                                        onClick={() => setHeaderStyle(h.id)}
                                        className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${headerStyle === h.id ? 'border-[#064e3b] bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                                    >
                                        <div className={`w-full h-10 rounded-xl mb-3 ${h.color} border border-black/5 shadow-inner`}></div>
                                        <p className="font-black text-[10px] uppercase text-center text-zinc-900 tracking-widest">{h.name}</p>
                                        {headerStyle === h.id && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-[#064e3b] text-white rounded-full shadow-md"><Check className="w-3 h-3" /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-black/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="font-black text-sm text-zinc-900 uppercase tracking-widest">Afficher le Logo</p>
                                    <p className="text-xs text-zinc-400 font-medium mt-1">Affiche le logo du restaurant dans l'en-tête du menu.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLogoEnabled(!isLogoEnabled)}
                                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isLogoEnabled ? 'border-[#064e3b] bg-[#064e3b] text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isLogoEnabled ? 'Activé' : 'Désactivé'}</span>
                                    <div className={`w-8 h-4 rounded-full relative transition-all ${isLogoEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isLogoEnabled ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] bg-zinc-50/50 border border-black/5">
                                <div className="relative group shrink-0">
                                    <div className={`w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center transition-all bg-white relative`}>
                                        {logoUrl ? (
                                            <Image src={logoUrl} alt="Logo Preview" fill className="object-cover" />
                                        ) : (
                                            <Upload className="w-10 h-10 text-zinc-200" />
                                        )}
                                        {uploadingLogo && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <RefreshCw className="w-8 h-8 text-[#064e3b] animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <label className="block text-sm font-bold text-zinc-900">Logo du Restaurant</label>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            onChange={handleUploadLogo}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="px-6 py-3 bg-white border border-black/5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <Upload className="w-4 h-4 text-[#c5a059]" />
                                            {logoUrl ? 'Changer le Logo' : 'Uploader un Logo'}
                                        </label>
                                        {logoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setLogoUrl('')}
                                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FLUX DE PAIEMENT SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-8 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Coins className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <h3>Flux de Paiement POS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setPaymentLogic('pay_before')}
                            className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-3 ${paymentLogic === 'pay_before' ? 'border-[#064e3b] bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentLogic === 'pay_before' ? 'bg-[#064e3b] text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm">Paiement à la commande</p>
                                <p className="text-[10px] text-zinc-400 font-medium">Le client paie avant la préparation (Fast-food, Comptoir).</p>
                            </div>
                        </button>

                        <button 
                            type="button"
                            onClick={() => setPaymentLogic('pay_after')}
                            className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-3 ${paymentLogic === 'pay_after' ? 'border-[#064e3b] bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentLogic === 'pay_after' ? 'bg-[#064e3b] text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-sm">Paiement après service</p>
                                <p className="text-[10px] text-zinc-400 font-medium">Le client consomme puis paie en fin de repas (Restaurant).</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* OPERATING HOURS SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Clock className="w-5 h-5 text-[#c5a059]" />
                        <h3>Operating Hours</h3>
                    </div>

                    <div className="space-y-4">
                        {openingHours.map((dayObj, index) => (
                            <div key={dayObj.day} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0 group">
                                <span className="text-sm font-bold text-zinc-700 w-24">{dayObj.day}</span>
                                <div className="flex items-center gap-4 flex-1 justify-end">
                                    <input 
                                        type="text" 
                                        value={dayObj.hours}
                                        onChange={(e) => {
                                            const newHours = [...openingHours]
                                            newHours[index].hours = e.target.value
                                            setOpeningHours(newHours)
                                        }}
                                        disabled={!dayObj.isOpen}
                                        placeholder="09:00 - 22:00"
                                        className="bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-xs font-bold w-32 focus:bg-white focus:border-[#064e3b] outline-none transition-all disabled:opacity-30"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newHours = [...openingHours]
                                            newHours[index].isOpen = !newHours[index].isOpen
                                            setOpeningHours(newHours)
                                        }}
                                        className={`w-12 h-6 rounded-full relative transition-all ${dayObj.isOpen ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dayObj.isOpen ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIFI SECTION */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Wifi className="w-5 h-5 mr-3 text-emerald-600" />
                            <h3>Guest WiFi Connectivity</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsWifiEnabled(!isWifiEnabled)}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isWifiEnabled ? 'border-[#064e3b] bg-[#064e3b] text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{isWifiEnabled ? 'Activé' : 'Désactivé'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${isWifiEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isWifiEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                    </div>

                    <div className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${isWifiEnabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none grayscale translate-y-2'}`}>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Network Name (SSID)</label>
                            <input
                                type="text"
                                value={wifiSsid}
                                onChange={(e) => setWifiSsid(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold transition-all shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">WiFi Password</label>
                            <input
                                type="text"
                                value={wifiPassword}
                                onChange={(e) => setWifiPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold font-mono transition-all shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Security Type</label>
                            <select
                                value={wifiSecurity}
                                onChange={(e) => setWifiSecurity(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold transition-all shadow-sm cursor-pointer"
                            >
                                <option value="WPA2">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">No Password</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SOCIAL MEDIA & LINKS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Globe className="w-5 h-5 mr-3 text-emerald-600" />
                            <h3>Social Media & Website</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSocialEnabled(!isSocialEnabled)}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isSocialEnabled ? 'border-[#064e3b] bg-[#064e3b] text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{isSocialEnabled ? 'Activé' : 'Désactivé'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${isSocialEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isSocialEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                    </div>

                    <div className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${isSocialEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                        {/* Instagram */}
                        <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100 shadow-sm">
                                        <Instagram className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Instagram</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsInstagramEnabled(!isInstagramEnabled)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isInstagramEnabled ? 'bg-pink-500' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isInstagramEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                disabled={!isInstagramEnabled}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-pink-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        {/* Facebook */}
                        <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                        <Facebook className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Facebook</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFacebookEnabled(!isFacebookEnabled)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isFacebookEnabled ? 'bg-blue-600' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isFacebookEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                disabled={!isFacebookEnabled}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-blue-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        {/* TikTok */}
                        <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
                                        <Music className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">TikTok</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsTiktokEnabled(!isTiktokEnabled)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isTiktokEnabled ? 'bg-black' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isTiktokEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={tiktokUrl}
                                onChange={(e) => setTiktokUrl(e.target.value)}
                                disabled={!isTiktokEnabled}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-zinc-400 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        {/* YouTube */}
                        <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                                        <Youtube className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">YouTube</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsYoutubeEnabled(!isYoutubeEnabled)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isYoutubeEnabled ? 'bg-red-600' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isYoutubeEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                disabled={!isYoutubeEnabled}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-red-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        {/* Website */}
                        <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#064e3b] border border-emerald-100 shadow-sm">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Site Web Officiel</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsWebsiteEnabled(!isWebsiteEnabled)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isWebsiteEnabled ? 'bg-[#064e3b]' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isWebsiteEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                disabled={!isWebsiteEnabled}
                                className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-[#064e3b] outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* LOCATION & ADDRESS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <MapPin className="w-5 h-5 mr-3 text-emerald-600" />
                            <h3>Location & Address</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLocationEnabled(!isLocationEnabled)}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isLocationEnabled ? 'border-[#064e3b] bg-[#064e3b] text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{isLocationEnabled ? 'Activé' : 'Désactivé'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${isLocationEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isLocationEnabled ? 'right-1' : 'left-1'}`} />
                            </div>
                        </button>
                    </div>

                    <div className={`grid gap-6 transition-all duration-300 ${isLocationEnabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none grayscale translate-y-2'}`}>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Physical Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full pl-5 pr-12 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] focus:ring-4 focus:ring-emerald-50 outline-none text-zinc-900 font-bold transition-all shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Google Maps Link</label>
                            <input
                                type="text"
                                value={googleMapsUrl}
                                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                className="w-full pl-5 pr-12 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] focus:ring-4 focus:ring-emerald-50 outline-none text-zinc-900 font-bold transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* STICKY SAVE BAR */}
                <div className="sticky bottom-8 left-0 right-0 z-20 flex items-center justify-end gap-6 p-6 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-black/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] mt-10">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 rounded-2xl font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#064e3b] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#053e2f] transition-all shadow-xl shadow-emerald-900/20 flex items-center disabled:opacity-50 hover:-translate-y-1 active:translate-y-0 text-sm"
                    >
                        {saving ? (
                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 mr-3" />
                        )}
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    )
}