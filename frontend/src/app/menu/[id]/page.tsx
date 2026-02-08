'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Category, Dish } from '@/types'
import Image from 'next/image'
import { DIETARY_TAGS } from '@/lib/constants'
import { X, Check, Leaf, Carrot, Beef, Flame, WheatOff, Medal, Fish, ShieldCheck, Heart, Star, Coffee, Wine, Beer, Pizza, Tag, Plus, Minus, ShoppingBag, MessageCircle, Wifi, Lock, Shield, Trash2, Search, SearchX, UtensilsCrossed, ArrowRight, Globe, MapPin, Phone, Instagram, Facebook, Compass, Youtube, Music, Sprout, Milk, Egg, Shrimp, Martini, GlassWater, Cake, IceCream, Cookie, Clock, Zap, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const BADGE_ICONS = {
    Leaf, Sprout, Carrot, Beef, Flame, WheatOff, Medal, Fish, Shrimp, ShieldCheck, Heart, Star, Sparkles, Zap, Clock, Coffee, Wine, Beer, Martini, GlassWater, Pizza, Cake, IceCream, Cookie, Milk, Egg
}

// Helper to fetch menu (public endpoint)
const fetchPublicMenu = async (restaurantId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${restaurantId}`)
    if (!res.ok) throw new Error('Failed to fetch menu')
    return res.json()
}

export default function PublicMenuPage() {
    const params = useParams()
    const [tableNumber, setTableNumber] = useState<string | null>(null)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        setTableNumber(urlParams.get('table'))
    }, [])

    const [restaurant, setRestaurant] = useState<any>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [selection, setSelection] = useState<Record<string, number>>({})
    const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
    const [isWifiModalOpen, setIsWifiModalOpen] = useState(false)
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
    const [feedbackRating, setFeedbackRating] = useState(5)
    const [feedbackComment, setFeedbackComment] = useState('')
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
    const [deliveryAddress, setDeliveryAddress] = useState('')

    // Force dine_in if table number is present
    useEffect(() => {
        if (tableNumber) {
            setOrderType('dine_in')
        }
    }, [tableNumber])

    const [searchQuery, setSearchQuery] = useState('')
    const [likedDishes, setLikedDishes] = useState<Set<string>>(new Set())
    const [sessionId, setSessionId] = useState<string>('')
    const [lang, setLang] = useState<'fr' | 'en'>('fr')

    const router = useRouter()

    useEffect(() => {
        if (params.id) {
            loadMenu(params.id as string)
            
            // Language logic
            const savedLang = localStorage.getItem('nore_lang')
            if (savedLang === 'en' || savedLang === 'fr') {
                setLang(savedLang)
            }

            // Realtime Menu Updates
            const channel = supabase
                .channel('public-menu-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants', filter: `id=eq.${params.id}` }, () => loadMenu(params.id as string))
                .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => loadMenu(params.id as string))
                .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => loadMenu(params.id as string))
                .subscribe()

            // Generate or retrieve session ID
            let sid = localStorage.getItem('nore_session_id')
            if (!sid) {
                sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
                localStorage.setItem('nore_session_id', sid)
            }
            setSessionId(sid)

            // Load liked dishes from localStorage
            const savedLikes = localStorage.getItem(`liked_dishes_${params.id}`)
            if (savedLikes) {
                setLikedDishes(new Set(JSON.parse(savedLikes)))
            }

            // Track QR scan
            trackQrScan(params.id as string)
        }
        // Load selection from local storage
        const saved = localStorage.getItem(`selection_${params.id}`)
        if (saved) setSelection(JSON.parse(saved))
    }, [params.id])

    useEffect(() => {
        if (params.id) {
            localStorage.setItem(`selection_${params.id}`, JSON.stringify(selection))
        }
    }, [selection, params.id])

    // Save liked dishes to localStorage
    useEffect(() => {
        if (params.id && likedDishes.size > 0) {
            localStorage.setItem(`liked_dishes_${params.id}`, JSON.stringify(Array.from(likedDishes)))
        }
    }, [likedDishes, params.id])

    const loadMenu = async (id: string) => {
        try {
            const data = await fetchPublicMenu(id)
            setRestaurant(data.restaurant)
            setCategories(data.categories)
            if (data.categories.length > 0) {
                setActiveCategory(data.categories[0].id)
            }
        } catch (err) {
            setError('Menu not found or failed to load.')
        } finally {
            setLoading(false)
        }
    }

    const submitFeedback = async () => {
        if (!params.id) return;
        setIsSubmittingFeedback(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: params.id,
                    rating: feedbackRating,
                    comment: feedbackComment,
                    tableNumber: tableNumber
                })
            });

            if (!res.ok) throw new Error('Failed to submit feedback');

            toast.success(lang === 'fr' ? 'Merci pour votre avis !' : 'Thank you for your feedback!');
            setIsFeedbackModalOpen(false);
            setFeedbackComment('');
            setFeedbackRating(5);
        } catch (err) {
            toast.error('Error submitting feedback');
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const toggleLang = () => {
        const newLang = lang === 'fr' ? 'en' : 'fr'
        setLang(newLang)
        localStorage.setItem('nore_lang', newLang)
    }

    const isCurrentlyOpen = () => {
        if (!restaurant?.opening_hours || restaurant.opening_hours.length === 0) return true
        
        const now = new Date()
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const currentDay = dayNames[now.getDay()]
        
        const dayConfig = restaurant.opening_hours.find((d: any) => d.day === currentDay)
        if (!dayConfig || !dayConfig.isOpen) return false
        
        try {
            const [start, end] = dayConfig.hours.split('-').map((s: string) => s.trim())
            const [startH, startM] = start.split(':').map(Number)
            const [endH, endM] = end.split(':').map(Number)
            
            const currentH = now.getHours()
            const currentM = now.getMinutes()
            
            const startTime = startH * 60 + startM
            const endTime = endH * 60 + endM
            const currentTime = currentH * 60 + currentM
            
            return currentTime >= startTime && currentTime <= endTime
        } catch (e) {
            return true // Fallback if format is wrong
        }
    }

    const t = (item: any, field: string) => {
        if (!item) return ''
        if (lang === 'en') {
            return item[`${field}_en`] || item[field]
        }
        return item[field]
    }

    // Track QR scan
    const trackQrScan = async (restaurantId: string) => {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            const table = urlParams.get('table')
            
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/qr-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    restaurantId,
                    tableNumber: table 
                })
            })
        } catch (err) {
            console.error('Failed to track QR scan:', err)
        }
    }

    // Track dish view
    const trackDishView = async (dishId: string) => {
        if (!params.id || !sessionId) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dish-view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: params.id,
                    dishId,
                    sessionId
                })
            })
        } catch (err) {
            console.error('Failed to track dish view:', err)
        }
    }

    // Toggle like on a dish
    const toggleLike = async (dishId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!params.id || !sessionId) return

        const newLikedDishes = new Set(likedDishes)
        if (newLikedDishes.has(dishId)) {
            newLikedDishes.delete(dishId)
        } else {
            newLikedDishes.add(dishId)
        }
        setLikedDishes(newLikedDishes)

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: params.id,
                    dishId,
                    sessionId
                })
            })
        } catch (err) {
            console.error('Failed to toggle like:', err)
            // Revert on error
            setLikedDishes(likedDishes)
        }
    }

    // Extract unique tags specifically for the current category
    const currentCategory = categories.find(c => c.id === activeCategory)
    const categoryTags = Array.from(new Set(
        currentCategory?.dishes?.flatMap((dish: Dish) => dish.tags || []) || []
    )).sort()

    const toggleFilter = (tag: string) => {
        setActiveFilter(activeFilter === tag ? null : tag)
    }

    const updateQuantity = (dishId: string, delta: number) => {
        setSelection(prev => {
            const current = prev[dishId] || 0
            const next = current + delta
            if (next <= 0) {
                const { [dishId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [dishId]: next }
        })
    }

    const removeFromSelection = (dishId: string) => {
        setSelection(prev => {
            const { [dishId]: _, ...rest } = prev
            return rest
        })
    }

    const sendWhatsAppOrder = async () => {
        if (!restaurant?.whatsapp_number) return;

        if (!isCurrentlyOpen()) {
            toast.error(lang === 'fr' 
                ? 'Le restaurant est actuellement fermé. Votre commande pourrait ne pas être traitée immédiatement.'
                : 'The restaurant is currently closed. Your order might not be processed immediately.')
        }

        const selectedItems: any[] = [];
        let message = `*${lang === 'fr' ? 'Commande' : 'Order'} - ${restaurant.name}*\n`;
        message += `Type: *${orderType === 'dine_in' ? 'Sur Place' : orderType === 'takeaway' ? 'Emporter' : 'Livraison'}*\n\n`;

        categories.forEach(c => {
            const selectedInCat = c.dishes?.filter(d => selection[d.id]) || [];
            if (selectedInCat.length > 0) {
                message += `*${t(c, 'name')} :*\n`;
                selectedInCat.forEach(d => {
                    message += `- ${t(d, 'name')} (x${selection[d.id]}) : ${(d.price * selection[d.id]).toLocaleString()} ${restaurant.currency || 'FCFA'}\n`;
                    if (itemNotes[d.id]) message += `  _Note: ${itemNotes[d.id]}_\n`;
                    
                    selectedItems.push({
                        name: t(d, 'name'),
                        price: d.price,
                        quantity: selection[d.id],
                        note: itemNotes[d.id]
                    });
                });
                message += `\n`;
            }
        });

        if (orderType === 'dine_in' && tableNumber) {
            message += `📍 *Table : ${tableNumber}*\n`;
        }
        
        if (orderType === 'delivery' && deliveryAddress) {
            message += `🏠 *Adresse : ${deliveryAddress}*\n`;
        }

        if (customerName) {
            message += `👤 *Client : ${customerName}*\n`;
        }

        message += `\n*Total : ${totalPrice.toLocaleString()} ${restaurant.currency || 'FCFA'}*`;

        // Log order intent to backend for dashboard
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/whatsapp-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: params.id,
                    items: selectedItems,
                    totalPrice,
                    customerName: customerName || undefined,
                    tableNumber: orderType === 'dine_in' ? tableNumber || undefined : undefined,
                    orderType,
                    deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined
                })
            });
        } catch (err) {
            console.error('Failed to log WhatsApp order:', err);
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanNumber = restaurant.whatsapp_number.replace(/[^\d+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        
        // Use window.location.href for better mobile compatibility
        // Mobile browsers often block window.open() if not triggered directly by user action
        window.location.href = whatsappUrl;
    };

    const makePhoneCall = () => {
        if (!restaurant?.phone_number) return;
        const cleanNumber = restaurant.phone_number.replace(/[^\d+]/g, '');
        window.location.href = `tel:${cleanNumber}`;
    };

    const totalItems = Object.values(selection).reduce((a, b) => a + b, 0)
    const totalPrice = categories
        .flatMap(c => c.dishes || [])
        .filter(d => selection[d.id])
        .reduce((sum, d) => sum + (d.price * selection[d.id]), 0)

    const isOrderingEnabled = restaurant?.is_ordering_enabled !== false

    const formatPrice = (price: number) => {
        return `${price.toLocaleString()} ${restaurant?.currency || 'FCFA'}`
    }

    // Search results calculation
    const searchResults = searchQuery ? categories.flatMap(cat =>
        (cat.dishes || [])
            .filter(dish =>
                dish.is_available !== false &&
                (t(dish, 'name').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t(dish, 'description')?.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(dish => ({ ...dish, category: cat }))
    ) : []

    // Reset filter when switching category
    useEffect(() => {
        setActiveFilter(null)
    }, [activeCategory])

    if (loading) return <div className="p-8 text-center text-zinc-500 font-medium h-screen flex items-center justify-center">Loading yummy dishes...</div>
    if (error) return <div className="p-8 text-center text-red-500 h-screen flex items-center justify-center">{error}</div>

    const isDark = restaurant?.theme === 'dark'
    const isNeutral = restaurant?.theme === 'neutral'
    const brandColor = restaurant?.primary_color || '#4f46e5'
    const fontFamily = restaurant?.font_family || 'font-sans'
    const headerStyle = restaurant?.header_style || 'minimal'

    return (
        <div
            style={{ '--brand-color': brandColor } as any}
            className={`min-h-screen ${fontFamily} pb-10 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' :
                isNeutral ? 'bg-[#fdfcfb] text-stone-900' :
                    'bg-[#fafafa] text-zinc-900'
                }`}
        >
            {/* STICKY HEADER */}
            <header className={`sticky top-0 z-30 transition-all duration-500 ${headerStyle === 'glassmorphism'
                ? isDark ? 'bg-zinc-900/40 backdrop-blur-xl border-b border-white/5' : 'bg-white/40 backdrop-blur-xl border-b border-gray-100'
                : headerStyle === 'gradient'
                    ? isDark ? 'bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/5 shadow-xl' : 'bg-gradient-to-r from-white to-zinc-50 border-b border-gray-200 shadow-lg'
                    : isDark ? 'bg-zinc-950 border-b border-white/5' : isNeutral ? 'bg-stone-50 border-b border-stone-200' : 'bg-white border-b border-gray-100'
                }`}>
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                    {!isSearchOpen ? (
                        <>
                            <h1 className={`text-xl font-black tracking-tighter shrink-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>Menu</h1>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleLang}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all border ${isDark ? 'bg-white/5 text-[#c5a059] border-white/10' : 'bg-white text-[#064e3b] border-black/5 shadow-sm'}`}
                                >
                                    {lang === 'fr' ? 'EN' : 'FR'}
                                </button>
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                {restaurant?.is_logo_enabled !== false ? (
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden font-black text-lg italic shadow-xl transition-transform active:scale-95 ${isDark ? 'text-black' : 'text-white'}`}
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {restaurant?.logo_url ? (
                                            <Image 
                                                src={restaurant.logo_url} 
                                                alt={restaurant.name} 
                                                width={48} 
                                                height={48} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            restaurant?.name?.charAt(0) || 'N'
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-12 h-12" /> // Spacer to maintain layout
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center gap-3 animation-pop-in">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={lang === 'fr' ? "Rechercher un plat..." : "Search for a dish..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 outline-none transition-all ${isDark ? 'bg-white/5 text-white focus:ring-[var(--brand-color)]/20' :
                                        isNeutral ? 'bg-stone-100 text-stone-900 focus:ring-stone-200' :
                                            'bg-zinc-50 text-zinc-900 focus:ring-indigo-100'}`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${isDark ? 'text-white/60 hover:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                className={`text-xs font-black uppercase tracking-widest p-2 active:scale-95 transition-all ${isDark ? 'text-white hover:text-white/80' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                {lang === 'fr' ? 'Annuler' : 'Cancel'}
                            </button>
                        </div>
                    )}
                </div>

                {/* CATEGORY TABS (Primary Navigation) - Hidden when searching */}
                {!searchQuery && (
                    <div className={`border-t flex overflow-x-auto no-scrollbar scroll-smooth transition-colors duration-500 ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-50'}`}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-4 whitespace-nowrap text-sm font-black tracking-tight border-b-2 transition-all duration-300 ${activeCategory === cat.id
                                    ? isDark ? 'border-[var(--brand-color)] text-white bg-white/5' :
                                        isNeutral ? 'border-stone-900 text-stone-900 bg-stone-100/50' :
                                            'border-zinc-900 text-zinc-900 bg-zinc-50/50'
                                    : isDark ? 'border-transparent text-white/50 hover:text-white' :
                                        isNeutral ? 'border-transparent text-stone-400 hover:text-stone-600' :
                                            'border-transparent text-zinc-400 hover:text-zinc-600'
                                    }`}
                            >
                                {t(cat, 'name')}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Content Area */}
            <main className="max-w-md mx-auto p-5">
                {/* RESTAURANT INFO & STATUS */}
                {!searchQuery && (
                    <div className="mb-10 animation-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className={`flex h-2 w-2 rounded-full ${isCurrentlyOpen() ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-zinc-500'}`}>
                                    {isCurrentlyOpen() 
                                        ? (lang === 'fr' ? 'Ouvert actuellement' : 'Currently Open') 
                                        : (lang === 'fr' ? 'Fermé' : 'Closed')}
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsHoursModalOpen(true)}
                                className={`p-2 rounded-full ${isDark ? 'bg-white/5 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                            >
                                <Clock className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className={`text-3xl font-serif font-bold italic tracking-tight mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {lang === 'fr' ? 'Bienvenue chez' : 'Welcome to'} {restaurant?.name}
                        </h2>
                        {t(restaurant, 'about') && (
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-zinc-500'}`}>
                                {t(restaurant, 'about')}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-6 overflow-x-auto no-scrollbar py-2">
                            {restaurant?.is_wifi_enabled !== false && (
                                <button onClick={() => setIsWifiModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5 text-emerald-400' : 'bg-white border-zinc-100 text-[#064e3b] shadow-sm'}`}>
                                    <Wifi className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Guest WiFi</span>
                                </button>
                            )}
                            {restaurant?.is_location_enabled !== false && (
                                <button onClick={() => setIsLocationModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5 text-[#c5a059]' : 'bg-white border-zinc-100 text-[#c5a059] shadow-sm'}`}>
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'fr' ? 'Plan' : 'Map'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {searchQuery ? (
                    <div className="animation-fade-in space-y-8">
                        <div>
                            <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : isNeutral ? 'text-stone-900' : 'text-gray-900'}`}>
                                {lang === 'fr' ? 'Résultats pour' : 'Results for'} <span className="text-[var(--brand-color)]">"{searchQuery}"</span>
                            </h2>
                            <div
                                className="w-12 h-1 rounded-full mt-2"
                                style={{ backgroundColor: brandColor }}
                            ></div>
                        </div>

                        <div className="grid gap-5">
                            {searchResults.length > 0 ? (
                                searchResults.map(dish => (
                                    <div
                                        key={dish.id}
                                        onClick={() => {
                                            setSelectedDish(dish)
                                            trackDishView(dish.id)
                                        }}
                                        className={`rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] border flex p-3 gap-4 active:scale-[0.98] transition-all group ${isDark ? 'bg-zinc-900 border-white/5 hover:border-white/10' :
                                            isNeutral ? 'bg-white border-stone-200 hover:border-stone-300' :
                                                'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`w-24 h-24 rounded-[1.8rem] overflow-hidden shrink-0 relative ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                            {dish.image_url ? (
                                                <Image
                                                    src={dish.image_url}
                                                    alt={t(dish, 'name')}
                                                    width={96}
                                                    height={96}
                                                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${dish.is_sold_out ? 'grayscale opacity-70' : ''}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                    <UtensilsCrossed className="w-8 h-8" />
                                                </div>
                                            )}
                                            {dish.is_sold_out && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white transform -rotate-12 bg-red-500 px-2 py-1 rounded-lg shadow-lg">
                                                        {lang === 'fr' ? 'Rupture' : 'Sold out'}
                                                    </span>
                                                </div>
                                            )}
                                            {(dish as any).is_specialty && (
                                                <div className="absolute top-1 left-1">
                                                    <div className="bg-[#c5a059] text-[#064e3b] p-1 rounded-lg shadow-lg">
                                                        <Sparkles className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 py-1 flex flex-col justify-center gap-1">
                                            <span className={`text-[8px] font-black tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>{t((dish as any).category, 'name')}</span>
                                            <h3 className={`font-black leading-tight transition-colors tracking-tight ${isDark ? 'text-white' : 'text-zinc-900 group-hover:text-amber-600'}`}>{t(dish, 'name')}</h3>
                                            <p className={`text-[10px] font-medium line-clamp-1 ${isDark ? 'text-white/50' : 'text-zinc-500'}`}>{t(dish, 'description')}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-black text-sm" style={{ color: brandColor }}>{formatPrice(dish.price)}</span>
                                                {(isOrderingEnabled && selection[dish.id]) && (
                                                    <span
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black animation-pop-in ${isDark ? 'text-black shadow-lg' : 'text-white'}`}
                                                        style={{ backgroundColor: brandColor }}
                                                    >
                                                        {selection[dish.id]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={`text-center py-20 rounded-[3rem] border-2 border-dashed transition-colors duration-500 ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-sm transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-100'}`}>
                                        <SearchX className="w-8 h-8 text-zinc-500 opacity-20" />
                                    </div>
                                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : currentCategory ? (
                    <div key={currentCategory.id} className="animation-fade-in">
                        <div className="mb-6 mt-2 flex flex-col gap-5">
                            <div>
                                <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : isNeutral ? 'text-stone-900' : 'text-gray-900'}`}>
                                    {t(currentCategory, 'name')}
                                </h2>
                                <div
                                    className="w-12 h-1 rounded-full mt-2"
                                    style={{ backgroundColor: brandColor }}
                                ></div>
                            </div>

                            {/* Dietary Filters - Specific to this category */}
                            {categoryTags.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                    <button
                                        onClick={() => setActiveFilter(null)}
                                        className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === null
                                            ? isDark ? 'bg-[var(--brand-color)] text-black shadow-lg shadow-[var(--brand-color)]/20' : 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                                            : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-zinc-100 text-zinc-400 border border-transparent'
                                            }`}
                                    >
                                        {lang === 'fr' ? 'Tous' : 'All'}
                                    </button>
                                    {categoryTags.map(tag => {
                                        const tagDef = DIETARY_TAGS.find(t => t.name === tag)
                                        const customBadge = currentCategory.badges?.find(b => b.name === tag)
                                        const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : Tag)
                                        const isActive = activeFilter === tag

                                        const tagName = customBadge ? t(customBadge, 'name') : (tagDef ? t(tagDef, 'name') : tag)

                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => toggleFilter(tag)}
                                                className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${isActive
                                                    ? isDark ? 'text-black shadow-lg ring-2 ring-white/10' : 'text-white shadow-lg ring-2 ring-zinc-50'
                                                    : isDark ? 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/10' :
                                                        isNeutral ? 'bg-white text-stone-500 border border-stone-200' :
                                                            'bg-white text-zinc-500 border border-zinc-200'
                                                    }`}
                                                style={isActive ? { backgroundColor: brandColor } : {}}
                                            >
                                                {Icon && <Icon className={`w-3 h-3 ${isActive ? isDark ? 'text-black' : 'text-white' : (tagDef?.color || '')}`} />}
                                                {tagName}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(currentCategory.dishes || [])
                                .filter((dish: Dish) => dish.is_available !== false)
                                .filter((dish: Dish) => !activeFilter || (dish.tags && dish.tags.includes(activeFilter)))
                                .map((dish: Dish) => {
                                    const isSpecialty = (dish as any).is_specialty;
                                    
                                    if (isSpecialty) {
                                        return (
                                            <div
                                                key={dish.id}
                                                onClick={() => { setSelectedDish(dish); trackDishView(dish.id); }}
                                                className={`rounded-[2.5rem] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] border flex flex-col transition-all hover:shadow-xl active:scale-[0.98] cursor-pointer ${isDark ? 'bg-zinc-900 border-white/5' : isNeutral ? 'bg-white border-stone-200' : 'bg-white border-white'}`}
                                            >
                                                {dish.image_url ? (
                                                    <div className="aspect-[16/10] w-full overflow-hidden relative">
                                                        <Image 
                                                            src={dish.image_url} 
                                                            alt={t(dish, 'name')} 
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 600px"
                                                            className={`object-cover ${dish.is_sold_out ? 'grayscale opacity-70' : ''}`} 
                                                        />
                                                        <div className="absolute top-4 left-4 flex flex-col gap-2 animate-in zoom-in duration-500">
                                                            <div className="bg-[#c5a059] text-[#064e3b] px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-white/20">
                                                                <Sparkles className="w-3 h-3" />
                                                                {lang === 'fr' ? 'Spécialité' : 'Signature'}
                                                            </div>
                                                            
                                                            {/* ICONS ON SPECIALTY IMAGE */}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {dish.tags?.map(tag => {
                                                                    const tagDef = DIETARY_TAGS.find(t => t.name === tag);
                                                                    const customBadge = currentCategory.badges?.find(b => b.name === tag);
                                                                    const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : null);
                                                                    if (!Icon) return null;
                                                                    return (
                                                                        <div key={tag} className="p-1.5 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
                                                                            <Icon className={`w-3.5 h-3.5 ${tagDef?.color || 'text-[#c5a059]'}`} />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        {dish.is_sold_out && (
                                                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                                                                <span className="bg-red-600/90 text-white px-5 py-2.5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl border border-white/20">
                                                                    {lang === 'fr' ? 'Rupture' : 'Sold Out'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="pt-6 px-7 flex animate-in fade-in duration-500">
                                                        <div className="bg-[#c5a059] text-[#064e3b] px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 border border-[#c5a059]/20">
                                                            <Sparkles className="w-3 h-3" />
                                                            {lang === 'fr' ? 'Spécialité' : 'Signature'}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="p-7">
                                                    <div className="flex justify-between items-start mb-4 gap-4">
                                                        <div className={dish.is_sold_out ? 'opacity-50' : ''}>
                                                            <h3 className={`font-black text-2xl leading-none mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t(dish, 'name')}</h3>
                                                            <p className={`text-sm leading-snug font-medium line-clamp-2 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{t(dish, 'description')}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                                            <div className={`px-4 py-2 rounded-2xl font-black text-sm shadow-xl transition-colors ${dish.is_sold_out ? isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400' : isDark ? 'text-black' : 'text-white'}`} style={!dish.is_sold_out ? { backgroundColor: brandColor } : {}}>
                                                                {formatPrice(dish.price)}
                                                            </div>
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <button onClick={(e) => toggleLike(dish.id, e)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-90 ${likedDishes.has(dish.id) ? 'bg-red-500 text-white' : isDark ? 'bg-white/5 text-zinc-400 hover:text-red-400' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${likedDishes.has(dish.id) ? 'fill-current' : ''}`} /></button>
                                                                {isOrderingEnabled && (
                                                                    <>
                                                                        {selection[dish.id] ? (
                                                                            <div className={`flex items-center rounded-2xl overflow-hidden p-1 border animation-pop-in ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                                                                <button onClick={() => updateQuantity(dish.id, -1)} className="w-10 h-10 flex items-center justify-center active:scale-75 transition-all text-zinc-400"><Minus className="w-4 h-4" /></button>
                                                                                <span className={`w-8 text-center font-black text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selection[dish.id]}</span>
                                                                                <button onClick={() => updateQuantity(dish.id, 1)} className="w-10 h-10 flex items-center justify-center active:scale-75 transition-all text-zinc-400"><Plus className="w-4 h-4" /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <button disabled={dish.is_sold_out} onClick={() => updateQuantity(dish.id, 1)} className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-90" style={!dish.is_sold_out ? { backgroundColor: brandColor, color: isDark ? 'black' : 'white' } : {}}><Plus className="w-6 h-6" /></button>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {!isOrderingEnabled && (
                                                                    <button onClick={(e) => toggleLike(dish.id, e)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg active:scale-90 ${likedDishes.has(dish.id) ? 'bg-red-500 text-white' : isDark ? 'bg-white/5 text-zinc-400 hover:text-red-400' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${likedDishes.has(dish.id) ? 'fill-current' : ''}`} /></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // NORMAL DISH: Horizontal
                                    return (
                                        <div
                                            key={dish.id}
                                            onClick={() => { setSelectedDish(dish); trackDishView(dish.id); }}
                                            className={`rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border flex p-3 gap-4 active:scale-[0.98] transition-all group ${isDark ? 'bg-zinc-900 border-white/5' : isNeutral ? 'bg-white border-stone-200' : 'bg-white border-gray-100'}`}
                                        >
                                            <div className={`w-28 h-28 rounded-[1.5rem] overflow-hidden shrink-0 relative ${isDark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                                                {dish.image_url ? (
                                                    <Image src={dish.image_url} alt={t(dish, 'name')} width={112} height={112} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${dish.is_sold_out ? 'grayscale opacity-70' : ''}`} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-200">
                                                        <UtensilsCrossed className="w-8 h-8" />
                                                    </div>
                                                )}
                                                
                                                {/* ICONS ON IMAGE */}
                                                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 max-w-[80%]">
                                                    {dish.tags?.map(tag => {
                                                        const tagDef = DIETARY_TAGS.find(t => t.name === tag);
                                                        const customBadge = currentCategory.badges?.find(b => b.name === tag);
                                                        const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : null);
                                                        if (!Icon) return null;
                                                        return (
                                                            <div key={tag} className="p-1 bg-white/90 backdrop-blur-md rounded-md shadow-sm border border-black/5">
                                                                <Icon className={`w-2.5 h-2.5 ${tagDef?.color || 'text-[#c5a059]'}`} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {dish.is_sold_out && (
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-white bg-red-500 px-2 py-1 rounded-lg">
                                                            {lang === 'fr' ? 'Rupture' : 'Sold out'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <h3 className={`font-black leading-tight tracking-tight truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t(dish, 'name')}</h3>
                                                    <p className={`text-[10px] font-medium line-clamp-2 mt-1 ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>{t(dish, 'description')}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                                                    <span className="font-black text-sm" style={{ color: brandColor }}>{formatPrice(dish.price)}</span>
                                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={(e) => toggleLike(dish.id, e)} className={`${likedDishes.has(dish.id) ? 'text-red-500' : 'text-zinc-300'}`}><Heart className={`w-4 h-4 ${likedDishes.has(dish.id) ? 'fill-current' : ''}`} /></button>
                                                        {isOrderingEnabled && (
                                                            <>
                                                                {selection[dish.id] ? (
                                                                    <div className={`flex items-center rounded-lg overflow-hidden p-0.5 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                                                        <button onClick={() => updateQuantity(dish.id, -1)} className="w-6 h-6 flex items-center justify-center text-zinc-400"><Minus className="w-3 h-3" /></button>
                                                                        <span className={`w-5 text-center font-black text-[10px] ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selection[dish.id]}</span>
                                                                        <button onClick={() => updateQuantity(dish.id, 1)} className="w-6 h-6 flex items-center justify-center text-zinc-400"><Plus className="w-3 h-3" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <button disabled={dish.is_sold_out} onClick={() => updateQuantity(dish.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm" style={!dish.is_sold_out ? { backgroundColor: brandColor, color: isDark ? 'black' : 'white' } : { backgroundColor: '#f4f4f5', color: '#ccc' }}><Plus className="w-4 h-4" /></button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Empty States */}
                            {currentCategory.dishes?.filter((dish: Dish) => dish.is_available !== false).length === 0 && (
                                <div className="text-center py-40">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border transition-colors ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-transparent'}`}>
                                        <X className={`w-8 h-8 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                                    </div>
                                    <p className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {lang === 'fr' ? 'Menu mis à jour bientôt' : 'Menu updated soon'}
                                    </p>
                                </div>
                            )}

                            {activeFilter && currentCategory.dishes?.filter((dish: Dish) => dish.is_available !== false && dish.tags?.includes(activeFilter)).length === 0 && currentCategory.dishes?.filter((dish: Dish) => dish.is_available !== false).length > 0 && (
                                <div className={`text-center py-20 rounded-[2rem] border-2 border-dashed transition-colors ${isDark ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-100/50 border-zinc-200'}`}>
                                    <p className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {lang === 'fr' ? 'Aucun plat correspondant' : 'No matching dishes'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={`text-center py-20 font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {lang === 'fr' ? 'Veuillez sélectionner une catégorie' : 'Please select a category'}
                    </div>
                )}
            </main>

            {/* FLOATING CART BUTTON */}
            {isOrderingEnabled && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
                    <button
                        onClick={() => setIsSelectionModalOpen(true)}
                        className={`px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all border group w-full justify-center ${totalItems > 0
                            ? isDark ? 'text-black border-transparent shadow-[var(--brand-color)]/20' : 'text-white border-transparent'
                            : isDark ? 'bg-zinc-900 text-zinc-600 border-white/5 opacity-80' :
                                isNeutral ? 'bg-stone-100 text-stone-400 border-stone-200' :
                                    'bg-zinc-100 text-zinc-400 border-zinc-200 opacity-80'}`}
                        style={totalItems > 0 ? { backgroundColor: brandColor } : {}}
                    >
                        <div className="relative">
                            <ShoppingBag className={`w-6 h-6 ${totalItems > 0 ? isDark ? 'text-black' : 'text-white' : ''}`} />
                            {totalItems > 0 && (
                                <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${isDark ? 'bg-white text-black border-zinc-900' : 'bg-zinc-900 text-white border-white'}`}>
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-0">
                            <span className="font-black text-sm tracking-tight">{lang === 'fr' ? 'Ma Sélection' : 'My Selection'}</span>
                            {totalItems > 0 && <span className={`text-[10px] font-bold opacity-80 ${isDark ? 'text-black' : 'text-white'}`}>{formatPrice(totalPrice)}</span>}
                        </div>
                        {totalItems > 0 && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            )}

            {/* DISH DETAIL MODAL (Bottom Sheet) */}
            {selectedDish && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animation-fade-in"
                        onClick={() => setSelectedDish(null)}
                    />
                    <div className={`relative w-full max-w-2xl mx-auto h-[92vh] overflow-hidden rounded-t-[3rem] shadow-2xl border-t flex flex-col animation-sheet-up transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-white/10' :
                        isNeutral ? 'bg-[#fdfcfb] border-stone-200' :
                            'bg-white border-zinc-100'}`}>
                        
                        <button
                            onClick={() => setSelectedDish(null)}
                            className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all z-30 shadow-2xl ${isDark ? 'bg-black/40 text-white border border-white/10' : 'bg-white/60 text-zinc-900 border border-black/5'} backdrop-blur-md`}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="overflow-y-auto no-scrollbar flex-1">
                            {/* Detail Image - FULL BLEED */}
                            {selectedDish.image_url && (
                                <div className="aspect-[16/11] w-full relative shrink-0">
                                    <Image
                                        src={selectedDish.image_url}
                                        alt={t(selectedDish, 'name')}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        className={`object-cover ${selectedDish.is_sold_out ? 'grayscale opacity-70' : ''}`}
                                        priority
                                    />
                                    {/* Ultra-Smooth Gradient */}
                                    <div 
                                        className="absolute inset-0 z-10 pointer-events-none"
                                        style={{
                                            background: `linear-gradient(to top, 
                                                ${isDark ? '#09090b' : '#fdfcfb'} 0%, 
                                                ${isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(253, 252, 251, 0.9)'} 15%, 
                                                ${isDark ? 'rgba(9, 9, 11, 0.5)' : 'rgba(253, 252, 251, 0.5)'} 30%, 
                                                ${isDark ? 'rgba(9, 9, 11, 0.2)' : 'rgba(253, 252, 251, 0.2)'} 45%, 
                                                transparent 70%
                                            )`
                                        }}
                                    ></div>
                                    
                                    <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
                                        {isOrderingEnabled && (
                                            <>
                                                {selection[selectedDish.id] ? (
                                                    <div className="flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); updateQuantity(selectedDish.id, -1); }}
                                                            className="p-4 text-white hover:bg-white/10 active:scale-90 transition-all font-black"
                                                        >
                                                            <Minus className="w-6 h-6" />
                                                        </button>
                                                        <span className="w-12 text-center text-white font-black text-xl">{selection[selectedDish.id]}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); updateQuantity(selectedDish.id, 1); }}
                                                            className="p-4 text-white hover:bg-white/10 active:scale-90 transition-all border-l border-white/10"
                                                        >
                                                            <Plus className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        disabled={selectedDish.is_sold_out}
                                                        onClick={(e) => { e.stopPropagation(); updateQuantity(selectedDish.id, 1); }}
                                                        className={`p-5 rounded-[2rem] backdrop-blur-md transition-all duration-300 shadow-2xl active:scale-90 ${selectedDish.is_sold_out
                                                            ? 'bg-zinc-200/50 text-zinc-400 cursor-not-allowed'
                                                            : 'bg-white/90 text-zinc-900'
                                                            }`}
                                                    >
                                                        <Plus className="w-8 h-8" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-4xl font-black tracking-tighter">{t(selectedDish, 'name')}</h2>
                                    <div className={`px-6 py-3 rounded-2xl font-black text-xl ${isDark ? 'bg-white/5 text-[#c5a059]' : 'bg-zinc-900 text-white'}`}>{formatPrice(selectedDish.price)}</div>
                                </div>
                                <p className="text-lg leading-relaxed text-zinc-500 font-medium mb-8">{t(selectedDish, 'description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MA SELECTION MODAL */}
            {isSelectionModalOpen && (
                <div className="fixed inset-0 z-[70] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectionModalOpen(false)} />
                    <div className={`relative rounded-t-[3rem] w-full max-w-2xl mx-auto h-[92vh] flex flex-col animation-sheet-up transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-t border-white/10' : isNeutral ? 'bg-[#fdfcfb] border-t border-stone-200' : 'bg-white border-t border-zinc-100'}`}>
                        {/* Pull Handle */}
                        <div className="w-full h-8 flex items-center justify-center shrink-0">
                            <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                        </div>

                        <header className={`px-8 py-5 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                            <div>
                                <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ma Sélection</h2>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Vos plats favoris</p>
                            </div>
                            <button onClick={() => setIsSelectionModalOpen(false)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-white/5 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        <main className="flex-1 overflow-y-auto p-8 space-y-6 pb-40 no-scrollbar">
                            {/* Order Type Selector */}
                            <div className={`p-6 rounded-[2.5rem] border space-y-4 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Mode de commande</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'dine_in', label: 'Sur Place', icon: UtensilsCrossed },
                                        { id: 'takeaway', label: 'Emporter', icon: ShoppingBag },
                                        { id: 'delivery', label: 'Livraison', icon: MapPin }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setOrderType(type.id as any)}
                                            className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === type.id 
                                                ? 'border-[var(--brand-color)] bg-[var(--brand-color)] text-white shadow-lg' 
                                                : isDark ? 'border-white/5 bg-black/20 text-white/40' : 'border-white bg-white text-zinc-400'}`}
                                        >
                                            <type.icon className="w-4 h-4" />
                                            <span className="text-[8px] font-black uppercase whitespace-nowrap">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {orderType === 'delivery' && (
                                    <input 
                                        type="text" 
                                        placeholder="Votre adresse de livraison..." 
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        className={`w-full p-4 rounded-2xl text-xs outline-none border transition-all ${isDark ? 'bg-black/20 border-white/10 text-white focus:border-[var(--brand-color)]' : 'bg-white border-zinc-200 text-zinc-900 focus:border-[var(--brand-color)]'}`}
                                    />
                                )}
                            </div>

                            {categories.flatMap(c => c.dishes || []).filter(d => selection[d.id]).map(dish => (
                                <div key={dish.id} className={`p-6 rounded-[2.5rem] border flex flex-col gap-4 transition-all ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-black text-lg truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t(dish, 'name')}</h4>
                                            <div className="font-black" style={{ color: brandColor }}>{formatPrice(dish.price)}</div>
                                        </div>
                                        <div className={`flex items-center rounded-2xl p-1 gap-1 border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                                            <button onClick={() => updateQuantity(dish.id, -1)} className={`w-10 h-10 flex items-center justify-center transition-all ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Minus className="w-4 h-4" /></button>
                                            <span className={`w-6 text-center font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selection[dish.id]}</span>
                                            <button onClick={() => updateQuantity(dish.id, 1)} className={`w-10 h-10 flex items-center justify-center transition-all ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Note (ex: sans sel...)" 
                                        value={itemNotes[dish.id] || ''} 
                                        onChange={(e) => setItemNotes(prev => ({...prev, [dish.id]: e.target.value}))} 
                                        className={`bg-transparent border-b text-xs outline-none pb-1 transition-all focus:border-[var(--brand-color)] ${isDark ? 'border-white/10 text-white/60 placeholder:text-white/20' : 'border-black/5 text-zinc-500'}`} 
                                    />
                                </div>
                            ))}
                        </main>

                        <div className={`sticky bottom-0 left-0 right-0 p-8 border-t shadow-2xl space-y-4 transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-white/10 shadow-black' : 'bg-white border-zinc-100'}`}>
                            <div className="flex justify-between items-end mb-4">
                                <span className={`text-[10px] font-black uppercase ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Total de la sélection</span>
                                <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{formatPrice(totalPrice)}</span>
                            </div>
                            <button 
                                onClick={sendWhatsAppOrder} 
                                className="w-full py-5 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                                style={{ backgroundColor: brandColor }}
                            >
                                <MessageCircle className="w-6 h-6" /> 
                                Envoyer via WhatsApp
                            </button>
                            <button 
                                onClick={() => setIsSelectionModalOpen(false)} 
                                className={`w-full py-4 font-bold uppercase text-[10px] tracking-widest ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WIFI, HOURS, FEEDBACK, LOCATION MODALS (Preserved) */}
            {isHoursModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHoursModalOpen(false)} />
                    <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                        <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><Clock className="w-10 h-10 text-[#c5a059]" /></div>
                        <h3 className="text-2xl font-black uppercase mb-6">Nos Horaires</h3>
                        <div className="space-y-3 mb-8">
                            {(restaurant?.opening_hours || []).map((h: any) => (
                                <div key={h.day} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0"><span className="text-xs font-bold text-zinc-400">{h.day}</span><span className={`text-xs font-black ${h.isOpen ? 'text-emerald-500' : 'text-red-400'}`}>{h.isOpen ? h.hours : 'Fermé'}</span></div>
                            ))}
                        </div>
                        <button onClick={() => setIsHoursModalOpen(false)} className="w-full py-4 bg-[#c5a059] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Fermer</button>
                    </div>
                </div>
            )}

            {isWifiModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWifiModalOpen(false)} />
                    <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                        <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><Wifi className="w-10 h-10 text-emerald-500" /></div>
                        <h3 className="text-2xl font-black uppercase mb-2">WiFi Gratuit</h3>
                        <div className="space-y-4 text-left my-8">
                            <div className="p-4 bg-zinc-50 rounded-2xl border"><p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Réseau</p><p className="font-bold text-zinc-900">{restaurant?.wifi_ssid}</p></div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border"><p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Mot de passe</p><p className="font-bold text-zinc-900">{restaurant?.wifi_password}</p></div>
                        </div>
                        <button onClick={() => setIsWifiModalOpen(false)} className="w-full py-4 bg-[#c5a059] text-white rounded-2xl font-black uppercase tracking-widest text-xs">OK</button>
                    </div>
                </div>
            )}

            {isFeedbackModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFeedbackModalOpen(false)} />
                    <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                        <h3 className="text-2xl font-black uppercase mb-2">Votre avis</h3>
                        <p className="text-zinc-400 text-xs mb-8">Aidez-nous à nous améliorer.</p>
                        <div className="flex justify-center gap-2 mb-8">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setFeedbackRating(s)} className={`text-2xl transition-all ${feedbackRating >= s ? 'text-amber-500 scale-110' : 'text-zinc-200'}`}><Star className={`w-8 h-8 ${feedbackRating >= s ? 'fill-current' : ''}`} /></button>)}</div>
                        <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Commentaire..." className="w-full p-4 bg-zinc-50 rounded-2xl mb-8 text-sm min-h-[100px] outline-none border border-zinc-100 focus:border-[#c5a059]" />
                        <button onClick={submitFeedback} disabled={isSubmittingFeedback} className="w-full py-4 bg-[#c5a059] text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">{isSubmittingFeedback ? 'Envoi...' : 'Envoyer'}</button>
                    </div>
                </div>
            )}

            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)} />
                    <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                        <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><MapPin className="w-10 h-10 text-[#c5a059]" /></div>
                        <h3 className="text-2xl font-black uppercase mb-2">Localisation</h3>
                        <p className="text-zinc-400 text-sm mb-8">{restaurant?.address}</p>
                        {restaurant?.google_maps_url && <a href={restaurant.google_maps_url} target="_blank" className="block w-full py-4 bg-[#c5a059] text-white rounded-2xl font-black uppercase tracking-widest text-xs mb-3 shadow-lg">Ouvrir Google Maps</a>}
                        <button onClick={() => setIsLocationModalOpen(false)} className="w-full py-4 bg-zinc-100 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-xs">Fermer</button>
                    </div>
                </div>
            )}
        </div>
    )
}
