'use client'

import { UtensilsCrossed, ShoppingBag, MapPin } from 'lucide-react'

interface OrderFormProps {
    isDark: boolean
    orderType: 'dine_in' | 'takeaway' | 'delivery'
    setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void
    deliveryAddress: string
    setDeliveryAddress: (address: string) => void
}

export default function OrderForm({
    isDark,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
}: OrderFormProps) {
    return (
        <div className={`p-6 rounded-[2.5rem] border space-y-4 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>Mode de commande</p>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'dine_in' as const, label: 'Sur Place', icon: UtensilsCrossed },
                    { id: 'takeaway' as const, label: 'Emporter', icon: ShoppingBag },
                    { id: 'delivery' as const, label: 'Livraison', icon: MapPin }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setOrderType(type.id)}
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
    )
}
