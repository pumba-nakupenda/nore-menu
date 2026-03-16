'use client'

import { Category, Dish } from '@/types'
import { SearchX } from 'lucide-react'
import DishCard from './DishCard'

interface SearchResultsProps {
    searchQuery: string
    searchResults: (Dish & { category: Category })[]
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    selection: Record<string, number>
    isOrderingEnabled: boolean
    likedDishes: Set<string>
    formatPrice: (price: number) => string
    updateQuantity: (dishId: string, delta: number) => void
    toggleLike: (dishId: string, e?: React.MouseEvent) => void
    onDishClick: (dish: Dish) => void
}

export default function SearchResults({
    searchQuery,
    searchResults,
    lang,
    isDark,
    isNeutral,
    brandColor,
    selection,
    isOrderingEnabled,
    likedDishes,
    formatPrice,
    updateQuantity,
    toggleLike,
    onDishClick,
}: SearchResultsProps) {
    return (
        <div className="animation-fade-in space-y-8">
            <div>
                <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : isNeutral ? 'text-stone-900' : 'text-gray-900'}`}>
                    {lang === 'fr' ? 'Resultats pour' : 'Results for'} <span className="text-[var(--brand-color)]">"{searchQuery}"</span>
                </h2>
                <div className="w-12 h-1 rounded-full mt-2" style={{ backgroundColor: brandColor }}></div>
            </div>

            <div className="grid gap-5">
                {searchResults.length > 0 ? searchResults.map(dish => (
                    <DishCard key={dish.id} dish={dish} category={dish.category} lang={lang}
                        isDark={isDark} isNeutral={isNeutral} brandColor={brandColor}
                        selection={selection} isOrderingEnabled={isOrderingEnabled}
                        likedDishes={likedDishes} formatPrice={formatPrice}
                        updateQuantity={updateQuantity} toggleLike={toggleLike}
                        onDishClick={onDishClick} />
                )) : (
                    <div className={`text-center py-20 rounded-[3rem] border-2 border-dashed transition-colors duration-500 ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-sm transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-100'}`}>
                            <SearchX className="w-8 h-8 text-zinc-500 opacity-20" />
                        </div>
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{lang === 'fr' ? 'Aucun resultat trouve' : 'No results found'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
