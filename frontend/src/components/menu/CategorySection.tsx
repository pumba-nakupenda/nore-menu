'use client'

import { Category, Dish } from '@/types'
import { DIETARY_TAGS, BADGE_ICONS } from '@/lib/constants'
import { Tag, X } from 'lucide-react'
import { translate } from '@/lib/translate'
import DishCard from './DishCard'

interface CategorySectionProps {
    category: Category
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    activeFilter: string | null
    setActiveFilter: (filter: string | null) => void
    toggleFilter: (tag: string) => void
    categoryTags: string[]
    selection: Record<string, number>
    isOrderingEnabled: boolean
    likedDishes: Set<string>
    formatPrice: (price: number) => string
    updateQuantity: (dishId: string, delta: number) => void
    toggleLike: (dishId: string, e?: React.MouseEvent) => void
    onDishClick: (dish: Dish) => void
}

export default function CategorySection({
    category,
    lang,
    isDark,
    isNeutral,
    brandColor,
    activeFilter,
    setActiveFilter,
    toggleFilter,
    categoryTags,
    selection,
    isOrderingEnabled,
    likedDishes,
    formatPrice,
    updateQuantity,
    toggleLike,
    onDishClick,
}: CategorySectionProps) {
    const t = (item: any, field: string) => translate(item, field, lang)

    const availableDishes = (category.dishes || []).filter((dish: Dish) => dish.is_available !== false)
    const filteredDishes = availableDishes.filter((dish: Dish) => !activeFilter || (dish.tags && dish.tags.includes(activeFilter)))

    return (
        <div key={category.id} className="animation-fade-in">
            <div className="mb-6 mt-2 flex flex-col gap-5">
                <div>
                    <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : isNeutral ? 'text-stone-900' : 'text-gray-900'}`}>
                        {t(category, 'name')}
                    </h2>
                    <div className="w-12 h-1 rounded-full mt-2" style={{ backgroundColor: brandColor }}></div>
                </div>

                {/* Dietary Filters */}
                {categoryTags.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                            onClick={() => setActiveFilter(null)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === null
                                ? isDark ? 'bg-[var(--brand-color)] text-black shadow-lg shadow-[var(--brand-color)]/20' : 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                                : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-zinc-100 text-zinc-400 border border-transparent'}`}
                        >
                            {lang === 'fr' ? 'Tous' : 'All'}
                        </button>
                        {categoryTags.map(tag => {
                            const tagDef = DIETARY_TAGS.find(td => td.name === tag)
                            const customBadge = category.badges?.find(b => b.name === tag)
                            const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : Tag)
                            const isActive = activeFilter === tag
                            const tagName = customBadge ? t(customBadge, 'name') : (tagDef ? t(tagDef, 'name') : tag)
                            return (
                                <button key={tag} onClick={() => toggleFilter(tag)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${isActive
                                        ? isDark ? 'text-black shadow-lg ring-2 ring-white/10' : 'text-white shadow-lg ring-2 ring-zinc-50'
                                        : isDark ? 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-white/10' : isNeutral ? 'bg-white text-stone-500 border border-stone-200' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                                    style={isActive ? { backgroundColor: brandColor } : {}}>
                                    {Icon && <Icon className={`w-3 h-3 ${isActive ? isDark ? 'text-black' : 'text-white' : (tagDef?.color || '')}`} />}
                                    {tagName}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {filteredDishes.map((dish: Dish) => (
                    <DishCard key={dish.id} dish={dish} category={category} lang={lang}
                        isDark={isDark} isNeutral={isNeutral} brandColor={brandColor}
                        selection={selection} isOrderingEnabled={isOrderingEnabled}
                        likedDishes={likedDishes} formatPrice={formatPrice}
                        updateQuantity={updateQuantity} toggleLike={toggleLike}
                        onDishClick={onDishClick} />
                ))}

                {availableDishes.length === 0 && (
                    <div className="text-center py-40">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border transition-colors ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-transparent'}`}>
                            <X className={`w-8 h-8 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                        </div>
                        <p className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {lang === 'fr' ? 'Menu mis a jour bientot' : 'Menu updated soon'}
                        </p>
                    </div>
                )}

                {activeFilter && filteredDishes.length === 0 && availableDishes.length > 0 && (
                    <div className={`text-center py-20 rounded-[2rem] border-2 border-dashed transition-colors ${isDark ? 'bg-zinc-900/30 border-white/5' : 'bg-zinc-100/50 border-zinc-200'}`}>
                        <p className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {lang === 'fr' ? 'Aucun plat correspondant' : 'No matching dishes'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
