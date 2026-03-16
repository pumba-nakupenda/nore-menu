'use client'

import { Dish } from '@/types'
import Image from 'next/image'
import { X, Plus, Minus } from 'lucide-react'
import { translate } from '@/lib/translate'

interface DishDetailModalProps {
    dish: Dish
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    selection: Record<string, number>
    isOrderingEnabled: boolean
    formatPrice: (price: number) => string
    updateQuantity: (dishId: string, delta: number) => void
    onClose: () => void
}

export default function DishDetailModal({
    dish,
    lang,
    isDark,
    isNeutral,
    brandColor,
    selection,
    isOrderingEnabled,
    formatPrice,
    updateQuantity,
    onClose,
}: DishDetailModalProps) {
    const t = (item: any, field: string) => translate(item, field, lang)

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animation-fade-in"
                onClick={onClose}
            />
            <div className={`relative w-full max-w-2xl mx-auto h-[92vh] overflow-hidden rounded-t-[3rem] shadow-2xl border-t flex flex-col animation-sheet-up transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-white/10' :
                isNeutral ? 'bg-background border-stone-200' :
                    'bg-white border-zinc-100'}`}>

                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all z-30 shadow-2xl ${isDark ? 'bg-black/40 text-white border border-white/10' : 'bg-white/60 text-zinc-900 border border-black/5'} backdrop-blur-md`}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto no-scrollbar flex-1">
                    {/* Detail Image - FULL BLEED */}
                    {dish.image_url && (
                        <div className="aspect-[16/11] w-full relative shrink-0">
                            <Image
                                src={dish.image_url}
                                alt={t(dish, 'name')}
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                className={`object-cover ${dish.is_sold_out ? 'grayscale opacity-70' : ''}`}
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
                                        {selection[dish.id] ? (
                                            <div className="flex items-center bg-zinc-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(dish.id, -1); }}
                                                    className="p-4 text-white hover:bg-white/10 active:scale-90 transition-all font-black"
                                                >
                                                    <Minus className="w-6 h-6" />
                                                </button>
                                                <span className="w-12 text-center text-white font-black text-xl">{selection[dish.id]}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(dish.id, 1); }}
                                                    className="p-4 text-white hover:bg-white/10 active:scale-90 transition-all border-l border-white/10"
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                disabled={dish.is_sold_out}
                                                onClick={(e) => { e.stopPropagation(); updateQuantity(dish.id, 1); }}
                                                className={`p-5 rounded-[2rem] backdrop-blur-md transition-all duration-300 shadow-2xl active:scale-90 ${dish.is_sold_out
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
                            <h2 className="text-4xl font-black tracking-tighter">{t(dish, 'name')}</h2>
                            <div className={`px-6 py-3 rounded-2xl font-black text-xl ${isDark ? 'bg-white/5 text-gold' : 'bg-zinc-900 text-white'}`}>{formatPrice(dish.price)}</div>
                        </div>
                        <p className="text-lg leading-relaxed text-zinc-500 font-medium mb-8">{t(dish, 'description')}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
