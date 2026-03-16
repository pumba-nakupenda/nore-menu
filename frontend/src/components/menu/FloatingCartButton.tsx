'use client'

import { ShoppingBag, ArrowRight } from 'lucide-react'

interface FloatingCartButtonProps {
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    totalItems: number
    totalPrice: number
    formatPrice: (price: number) => string
    onOpen: () => void
}

export default function FloatingCartButton({
    lang,
    isDark,
    isNeutral,
    brandColor,
    totalItems,
    totalPrice,
    formatPrice,
    onOpen,
}: FloatingCartButtonProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
            <button
                onClick={onOpen}
                className={`px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all border group w-full justify-center ${totalItems > 0
                    ? isDark ? 'text-black border-transparent shadow-[var(--brand-color)]/20' : 'text-white border-transparent'
                    : isDark ? 'bg-zinc-900 text-zinc-600 border-white/5 opacity-80' : isNeutral ? 'bg-stone-100 text-stone-400 border-stone-200' : 'bg-zinc-100 text-zinc-400 border-zinc-200 opacity-80'}`}
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
                    <span className="font-black text-sm tracking-tight">{lang === 'fr' ? 'Ma Selection' : 'My Selection'}</span>
                    {totalItems > 0 && <span className={`text-[10px] font-bold opacity-80 ${isDark ? 'text-black' : 'text-white'}`}>{formatPrice(totalPrice)}</span>}
                </div>
                {totalItems > 0 && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
        </div>
    )
}
