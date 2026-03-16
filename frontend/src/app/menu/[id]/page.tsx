'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Category, Dish } from '@/types'
import { toast } from 'sonner'
import { fetchMenuData } from '@/hooks/useFetchMenu'
import { useMenuFilters } from '@/hooks/useMenuFilters'
import { useMenuOrder } from '@/hooks/useMenuOrder'
import MenuHeader from '@/components/menu/MenuHeader'
import DishDetailModal from '@/components/menu/DishDetailModal'
import OrderSummary from '@/components/menu/OrderSummary'
import FloatingCartButton from '@/components/menu/FloatingCartButton'
import CategorySection from '@/components/menu/CategorySection'
import SearchResults from '@/components/menu/SearchResults'
import { HoursModal, WifiModal, FeedbackModal, LocationModal } from '@/components/menu/InfoModals'

export default function PublicMenuPage() {
    const params = useParams()
    const [tableNumber, setTableNumber] = useState<string | null>(null)
    const [restaurant, setRestaurant] = useState<any>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
    const [isWifiModalOpen, setIsWifiModalOpen] = useState(false)
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
    const [feedbackRating, setFeedbackRating] = useState(5)
    const [feedbackComment, setFeedbackComment] = useState('')
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [likedDishes, setLikedDishes] = useState<Set<string>>(new Set())
    const [sessionId, setSessionId] = useState<string>('')
    const [lang, setLang] = useState<'fr' | 'en'>('fr')

    const filters = useMenuFilters(categories, lang)
    const order = useMenuOrder({
        restaurantId: params.id as string | undefined,
        restaurant, categories, tableNumber, lang,
    })

    // --- Table number from URL ---
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        setTableNumber(urlParams.get('table'))
    }, [])

    // --- Main data loading, realtime, session, likes, QR tracking ---
    useEffect(() => {
        if (!params.id) return
        loadMenu(params.id as string)

        const savedLang = localStorage.getItem('nore_lang')
        if (savedLang === 'en' || savedLang === 'fr') setLang(savedLang)

        const channel = supabase
            .channel(`public-menu-updates-${params.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants', filter: `id=eq.${params.id}` }, () => loadMenu(params.id as string))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `restaurant_id=eq.${params.id}` }, () => loadMenu(params.id as string))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes', filter: `restaurant_id=eq.${params.id}` }, () => loadMenu(params.id as string))
            .subscribe()

        let sid = localStorage.getItem('nore_session_id')
        if (!sid) {
            sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
            localStorage.setItem('nore_session_id', sid)
        }
        setSessionId(sid)

        const savedLikes = localStorage.getItem(`liked_dishes_${params.id}`)
        if (savedLikes) setLikedDishes(new Set(JSON.parse(savedLikes)))

        trackQrScan(params.id as string)
        return () => { supabase.removeChannel(channel) }
    }, [params.id])

    // --- Persist likes ---
    useEffect(() => {
        if (params.id && likedDishes.size > 0)
            localStorage.setItem(`liked_dishes_${params.id}`, JSON.stringify(Array.from(likedDishes)))
    }, [likedDishes, params.id])

    const loadMenu = async (id: string) => {
        try {
            const data = await fetchMenuData(id)
            setRestaurant(data.restaurant)
            setCategories(data.categories)
            if (data.categories.length > 0) filters.setActiveCategory(data.categories[0].id)
        } catch { setError('Menu not found or failed to load.') }
        finally { setLoading(false) }
    }

    const isCurrentlyOpen = () => {
        if (!restaurant?.opening_hours || restaurant.opening_hours.length === 0) return true
        const now = new Date()
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const dayConfig = restaurant.opening_hours.find((d: any) => d.day === dayNames[now.getDay()])
        if (!dayConfig || !dayConfig.isOpen) return false
        try {
            const [start, end] = dayConfig.hours.split('-').map((s: string) => s.trim())
            const [sH, sM] = start.split(':').map(Number)
            const [eH, eM] = end.split(':').map(Number)
            const cur = now.getHours() * 60 + now.getMinutes()
            return cur >= sH * 60 + sM && cur <= eH * 60 + eM
        } catch { return true }
    }

    const toggleLang = () => { const n = lang === 'fr' ? 'en' : 'fr'; setLang(n); localStorage.setItem('nore_lang', n) }

    const submitFeedback = async () => {
        if (!params.id) return
        setIsSubmittingFeedback(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: params.id, rating: feedbackRating, comment: feedbackComment, tableNumber })
            })
            if (!res.ok) throw new Error('Failed')
            toast.success(lang === 'fr' ? 'Merci pour votre avis !' : 'Thank you for your feedback!')
            setIsFeedbackModalOpen(false); setFeedbackComment(''); setFeedbackRating(5)
        } catch { toast.error('Error submitting feedback') }
        finally { setIsSubmittingFeedback(false) }
    }

    const trackQrScan = async (restaurantId: string) => {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/qr-scan`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId, tableNumber: urlParams.get('table') })
            })
        } catch (err) { console.error('Failed to track QR scan:', err) }
    }

    const trackDishView = async (dishId: string) => {
        if (!params.id || !sessionId) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dish-view`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: params.id, dishId, sessionId })
            })
        } catch (err) { console.error('Failed to track dish view:', err) }
    }

    const toggleLike = async (dishId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!params.id || !sessionId) return
        const next = new Set(likedDishes)
        next.has(dishId) ? next.delete(dishId) : next.add(dishId)
        setLikedDishes(next)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/like`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: params.id, dishId, sessionId })
            })
        } catch { setLikedDishes(likedDishes) }
    }

    const handleDishClick = (dish: Dish) => { setSelectedDish(dish); trackDishView(dish.id) }

    if (loading) return <div className="p-8 text-center text-zinc-500 font-medium h-screen flex items-center justify-center">Loading yummy dishes...</div>
    if (error) return <div className="p-8 text-center text-red-500 h-screen flex items-center justify-center">{error}</div>

    const isDark = restaurant?.theme === 'dark'
    const isNeutral = restaurant?.theme === 'neutral'
    const brandColor = restaurant?.primary_color || '#4f46e5'
    const fontFamily = restaurant?.font_family || 'font-sans'
    const { currentCategory, searchQuery, searchResults, activeFilter, categoryTags } = filters

    const sharedProps = { lang, isDark, isNeutral, brandColor, selection: order.selection, isOrderingEnabled: order.isOrderingEnabled, likedDishes, formatPrice: order.formatPrice, updateQuantity: order.updateQuantity, toggleLike, onDishClick: handleDishClick } as const

    return (
        <div style={{ '--brand-color': brandColor } as any}
            className={`min-h-screen ${fontFamily} pb-10 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : isNeutral ? 'bg-background text-stone-900' : 'bg-[#fafafa] text-zinc-900'}`}>

            <MenuHeader restaurant={restaurant} categories={categories} lang={lang}
                isDark={isDark} isNeutral={isNeutral} brandColor={brandColor}
                isSearchOpen={filters.isSearchOpen} setIsSearchOpen={filters.setIsSearchOpen}
                searchQuery={searchQuery} setSearchQuery={filters.setSearchQuery}
                activeCategory={filters.activeCategory} setActiveCategory={filters.setActiveCategory}
                toggleLang={toggleLang} isCurrentlyOpen={isCurrentlyOpen}
                setIsWifiModalOpen={setIsWifiModalOpen} setIsHoursModalOpen={setIsHoursModalOpen}
                setIsLocationModalOpen={setIsLocationModalOpen} />

            <main className="max-w-md mx-auto p-5">
                {searchQuery ? (
                    <SearchResults searchQuery={searchQuery} searchResults={searchResults} {...sharedProps} />
                ) : currentCategory ? (
                    <CategorySection category={currentCategory} categoryTags={categoryTags}
                        activeFilter={activeFilter} setActiveFilter={filters.setActiveFilter}
                        toggleFilter={filters.toggleFilter} {...sharedProps} />
                ) : (
                    <div className={`text-center py-20 font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {lang === 'fr' ? 'Veuillez selectionner une categorie' : 'Please select a category'}
                    </div>
                )}
            </main>

            {order.isOrderingEnabled && (
                <FloatingCartButton lang={lang} isDark={isDark} isNeutral={isNeutral} brandColor={brandColor}
                    totalItems={order.totalItems} totalPrice={order.totalPrice}
                    formatPrice={order.formatPrice} onOpen={() => order.setIsSelectionModalOpen(true)} />
            )}

            {selectedDish && (
                <DishDetailModal dish={selectedDish} lang={lang} isDark={isDark} isNeutral={isNeutral}
                    brandColor={brandColor} selection={order.selection} isOrderingEnabled={order.isOrderingEnabled}
                    formatPrice={order.formatPrice} updateQuantity={order.updateQuantity}
                    onClose={() => setSelectedDish(null)} />
            )}

            {order.isSelectionModalOpen && (
                <OrderSummary categories={categories} lang={lang} isDark={isDark} isNeutral={isNeutral}
                    brandColor={brandColor} selection={order.selection} itemNotes={order.itemNotes}
                    setItemNotes={order.setItemNotes} totalPrice={order.totalPrice}
                    formatPrice={order.formatPrice} updateQuantity={order.updateQuantity}
                    sendWhatsAppOrder={order.sendWhatsAppOrder}
                    onClose={() => order.setIsSelectionModalOpen(false)}
                    orderType={order.orderType} setOrderType={order.setOrderType}
                    deliveryAddress={order.deliveryAddress} setDeliveryAddress={order.setDeliveryAddress} />
            )}

            {isHoursModalOpen && <HoursModal restaurant={restaurant} isDark={isDark} onClose={() => setIsHoursModalOpen(false)} />}
            {isWifiModalOpen && <WifiModal restaurant={restaurant} isDark={isDark} onClose={() => setIsWifiModalOpen(false)} />}
            {isFeedbackModalOpen && <FeedbackModal isDark={isDark} feedbackRating={feedbackRating} setFeedbackRating={setFeedbackRating} feedbackComment={feedbackComment} setFeedbackComment={setFeedbackComment} isSubmittingFeedback={isSubmittingFeedback} submitFeedback={submitFeedback} onClose={() => setIsFeedbackModalOpen(false)} />}
            {isLocationModalOpen && <LocationModal restaurant={restaurant} isDark={isDark} onClose={() => setIsLocationModalOpen(false)} />}
        </div>
    )
}
