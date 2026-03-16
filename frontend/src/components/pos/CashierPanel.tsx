'use client'

import { useState } from 'react'
import { PackageCheck, ShoppingBag } from 'lucide-react'
import CartDrawer from './CartDrawer'

interface CashierPanelProps {
    categories: any[]
    orders: any[]
    staff: any
    currency: string
    paymentLogic: 'pay_before' | 'pay_after'
    onToggleDishAvailability: (dishId: string, currentStatus: boolean) => void
    onUpdateOrderStatus: (id: string, status: string, isPaid?: boolean) => void
    onSubmitManualOrder: (cart: Record<string, number>, itemNotes: Record<string, string>, manualType: string, manualTable: string, manualName: string, manualAddress: string) => Promise<void>
}

export default function CashierPanel({ categories, orders, staff, currency, paymentLogic, onToggleDishAvailability, onUpdateOrderStatus, onSubmitManualOrder }: CashierPanelProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(categories.length > 0 ? categories[0].id : null)
    const [cart, setCart] = useState<Record<string, number>>({})
    const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
    const [manualTable, setManualTable] = useState('')
    const [manualName, setManualName] = useState('')
    const [manualAddress, setManualAddress] = useState('')
    const [manualType, setManualType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
    const [isCartOpen, setIsCartOpen] = useState(false)

    const updateCart = (dishId: string, delta: number) => {
        setCart(prev => {
            const current = prev[dishId] || 0
            const next = current + delta
            if (next <= 0) { const { [dishId]: _, ...rest } = prev; return rest; }
            return { ...prev, [dishId]: next }
        })
    }

    const cartTotal = categories.flatMap(c => c.dishes || []).filter(d => cart[d.id]).reduce((sum, d) => sum + (d.price * cart[d.id]), 0)

    const handleSubmit = async () => {
        await onSubmitManualOrder(cart, itemNotes, manualType, manualTable, manualName, manualAddress)
        setCart({}); setManualTable(''); setManualName(''); setManualAddress('');
        setIsCartOpen(false)
    }

    return (
        <div className="absolute inset-0 flex flex-col lg:flex-row animate-in fade-in duration-300">
            <div className="flex-1 flex flex-col bg-[#fafafa] border-r overflow-hidden">
                <header className="bg-white p-4 lg:p-6 border-b flex gap-2 overflow-x-auto no-scrollbar shrink-0">{categories.map(cat => (<button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase border-2 transition-all shrink-0 ${activeCategory === cat.id ? 'bg-gold border-gold text-brand' : 'bg-white border-zinc-100 text-zinc-400'}`}>{cat.name}</button>))}</header>
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-3 lg:gap-6 no-scrollbar pb-32">
                    {categories.find(c => c.id === activeCategory)?.dishes?.map((dish: any) => (
                        <div key={dish.id} onClick={() => dish.is_available !== false && updateCart(dish.id, 1)} className={`group bg-white rounded-2xl lg:rounded-[2.5rem] border-2 transition-all cursor-pointer overflow-hidden flex flex-col relative ${dish.is_available === false ? 'opacity-50 grayscale' : ''} ${cart[dish.id] ? 'border-gold shadow-xl' : 'border-white hover:border-zinc-200'}`}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleDishAvailability(dish.id, dish.is_available !== false); }}
                                className={`absolute top-2 right-2 lg:top-4 lg:right-4 z-10 p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all ${dish.is_available === false ? 'bg-red-500 text-white' : 'bg-white/90 text-zinc-400 hover:text-emerald-500 shadow-lg'}`}
                                title={dish.is_available === false ? "Reactiver le plat" : "Marquer comme epuise"}
                            >
                                <PackageCheck className="w-3.5 h-3.5 lg:w-4 h-4" />
                            </button>
                            {dish.image_url && <div className="aspect-[4/3] lg:aspect-video relative overflow-hidden"><img src={dish.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" /></div>}
                            <div className="p-3 lg:p-6 flex-1 flex flex-col">
                                <h4 className="font-black text-xs lg:text-lg text-zinc-900 leading-tight mb-1 lg:mb-2 line-clamp-2">{dish.name}</h4>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-sm lg:text-xl font-black text-gold">{dish.price.toLocaleString()} {currency}</span>
                                    {cart[dish.id] && <div className="w-6 h-6 lg:w-10 lg:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] lg:text-base font-black animate-pop-in">{cart[dish.id]}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MOBILE CART TOGGLE */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full px-6">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Voir Panier ({Object.values(cart).reduce((a, b) => a + b, 0)})
                        <span className="ml-2 px-3 py-1 bg-white/20 rounded-lg">{cartTotal.toLocaleString()} {currency}</span>
                    </button>
                </div>
            </div>

            <CartDrawer
                categories={categories}
                orders={orders}
                staff={staff}
                currency={currency}
                paymentLogic={paymentLogic}
                cart={cart}
                cartTotal={cartTotal}
                isCartOpen={isCartOpen}
                manualType={manualType}
                manualTable={manualTable}
                manualName={manualName}
                manualAddress={manualAddress}
                onSetIsCartOpen={setIsCartOpen}
                onSetManualType={setManualType}
                onSetManualTable={setManualTable}
                onSetManualName={setManualName}
                onSetManualAddress={setManualAddress}
                onUpdateCart={updateCart}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
