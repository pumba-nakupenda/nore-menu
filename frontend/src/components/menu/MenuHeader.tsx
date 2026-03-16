'use client'

import { Category } from '@/types'
import Image from 'next/image'
import { X, Search, Wifi, MapPin, Clock } from 'lucide-react'
import { translate } from '@/lib/translate'

interface MenuHeaderProps {
    restaurant: any
    categories: Category[]
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    // Search
    isSearchOpen: boolean
    setIsSearchOpen: (open: boolean) => void
    searchQuery: string
    setSearchQuery: (q: string) => void
    // Category
    activeCategory: string | null
    setActiveCategory: (id: string | null) => void
    // Actions
    toggleLang: () => void
    isCurrentlyOpen: () => boolean
    setIsWifiModalOpen: (open: boolean) => void
    setIsHoursModalOpen: (open: boolean) => void
    setIsLocationModalOpen: (open: boolean) => void
}

export default function MenuHeader({
    restaurant,
    categories,
    lang,
    isDark,
    isNeutral,
    brandColor,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    toggleLang,
    isCurrentlyOpen,
    setIsWifiModalOpen,
    setIsHoursModalOpen,
    setIsLocationModalOpen,
}: MenuHeaderProps) {
    const t = (item: any, field: string) => translate(item, field, lang)
    const headerStyle = restaurant?.header_style || 'minimal'

    return (
        <>
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
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all border ${isDark ? 'bg-white/5 text-gold border-white/10' : 'bg-white text-brand border-black/5 shadow-sm'}`}
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
                                    <div className="w-12 h-12" />
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

                {/* CATEGORY TABS - Hidden when searching */}
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

            {/* RESTAURANT INFO & STATUS - shown below header when not searching */}
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
                            <button onClick={() => setIsWifiModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5 text-emerald-400' : 'bg-white border-zinc-100 text-brand shadow-sm'}`}>
                                <Wifi className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Guest WiFi</span>
                            </button>
                        )}
                        {restaurant?.is_location_enabled !== false && (
                            <button onClick={() => setIsLocationModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5 text-gold' : 'bg-white border-zinc-100 text-gold shadow-sm'}`}>
                                <MapPin className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'fr' ? 'Plan' : 'Map'}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
