'use client'

import { Dish, Category, Badge } from '@/types'
import Image from 'next/image'
import { DIETARY_TAGS, BADGE_ICONS } from '@/lib/constants'
import { Tag, Plus, Minus, UtensilsCrossed, Sparkles, Heart } from 'lucide-react'
import { translate } from '@/lib/translate'

interface DishCardProps {
    dish: Dish
    category: Category
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

export default function DishCard({
    dish,
    category,
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
}: DishCardProps) {
    const t = (item: any, field: string) => translate(item, field, lang)
    const isSpecialty = (dish as any).is_specialty

    if (isSpecialty) {
        return (
            <div
                onClick={() => onDishClick(dish)}
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
                            <div className="bg-gold text-brand px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-white/20">
                                <Sparkles className="w-3 h-3" />
                                {lang === 'fr' ? 'Specialite' : 'Signature'}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {dish.tags?.map(tag => {
                                    const tagDef = DIETARY_TAGS.find(t => t.name === tag)
                                    const customBadge = category.badges?.find(b => b.name === tag)
                                    const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : null)
                                    if (!Icon) return null
                                    return (
                                        <div key={tag} className="p-1.5 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
                                            <Icon className={`w-3.5 h-3.5 ${tagDef?.color || 'text-gold'}`} />
                                        </div>
                                    )
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
                        <div className="bg-gold text-brand px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 border border-gold/20">
                            <Sparkles className="w-3 h-3" />
                            {lang === 'fr' ? 'Specialite' : 'Signature'}
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
        )
    }

    // NORMAL DISH: Horizontal
    return (
        <div
            onClick={() => onDishClick(dish)}
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
                        const tagDef = DIETARY_TAGS.find(t => t.name === tag)
                        const customBadge = category.badges?.find(b => b.name === tag)
                        const Icon = tagDef?.icon || (customBadge ? (BADGE_ICONS as any)[customBadge.icon] : null)
                        if (!Icon) return null
                        return (
                            <div key={tag} className="p-1 bg-white/90 backdrop-blur-md rounded-md shadow-sm border border-black/5">
                                <Icon className={`w-2.5 h-2.5 ${tagDef?.color || 'text-gold'}`} />
                            </div>
                        )
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
    )
}
