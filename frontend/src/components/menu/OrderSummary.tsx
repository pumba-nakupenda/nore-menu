'use client'

import { Category, Dish } from '@/types'
import { X, Plus, Minus, MessageCircle } from 'lucide-react'
import { translate } from '@/lib/translate'
import OrderForm from './OrderForm'

interface OrderSummaryProps {
    categories: Category[]
    lang: 'fr' | 'en'
    isDark: boolean
    isNeutral: boolean
    brandColor: string
    selection: Record<string, number>
    itemNotes: Record<string, string>
    setItemNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>
    totalPrice: number
    formatPrice: (price: number) => string
    updateQuantity: (dishId: string, delta: number) => void
    sendWhatsAppOrder: () => Promise<void>
    onClose: () => void
    // Order form props
    orderType: 'dine_in' | 'takeaway' | 'delivery'
    setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void
    deliveryAddress: string
    setDeliveryAddress: (address: string) => void
}

export default function OrderSummary({
    categories,
    lang,
    isDark,
    isNeutral,
    brandColor,
    selection,
    itemNotes,
    setItemNotes,
    totalPrice,
    formatPrice,
    updateQuantity,
    sendWhatsAppOrder,
    onClose,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
}: OrderSummaryProps) {
    const t = (item: any, field: string) => translate(item, field, lang)

    return (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative rounded-t-[3rem] w-full max-w-2xl mx-auto h-[92vh] flex flex-col animation-sheet-up transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-t border-white/10' : isNeutral ? 'bg-background border-t border-stone-200' : 'bg-white border-t border-zinc-100'}`}>
                {/* Pull Handle */}
                <div className="w-full h-8 flex items-center justify-center shrink-0">
                    <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                </div>

                <header className={`px-8 py-5 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                    <div>
                        <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ma Selection</h2>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Vos plats favoris</p>
                    </div>
                    <button onClick={onClose} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-white/5 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-6 pb-40 no-scrollbar">
                    {/* Order Type Selector */}
                    <OrderForm
                        isDark={isDark}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        deliveryAddress={deliveryAddress}
                        setDeliveryAddress={setDeliveryAddress}
                    />

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
                                onChange={(e) => setItemNotes(prev => ({ ...prev, [dish.id]: e.target.value }))}
                                className={`bg-transparent border-b text-xs outline-none pb-1 transition-all focus:border-[var(--brand-color)] ${isDark ? 'border-white/10 text-white/60 placeholder:text-white/20' : 'border-black/5 text-zinc-500'}`}
                            />
                        </div>
                    ))}
                </main>

                <div className={`sticky bottom-0 left-0 right-0 p-8 border-t shadow-2xl space-y-4 transition-colors duration-500 ${isDark ? 'bg-zinc-950 border-white/10 shadow-black' : 'bg-white border-zinc-100'}`}>
                    <div className="flex justify-between items-end mb-4">
                        <span className={`text-[10px] font-black uppercase ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Total de la selection</span>
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
                        onClick={onClose}
                        className={`w-full py-4 font-bold uppercase text-[10px] tracking-widest ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Retour au menu
                    </button>
                </div>
            </div>
        </div>
    )
}
