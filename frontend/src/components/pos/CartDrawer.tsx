'use client'

import { ShoppingBag, Minus, Plus, X, XCircle, CreditCard, Send, MessageCircle, LayoutGrid } from 'lucide-react'

interface CartDrawerProps {
    categories: any[]
    orders: any[]
    staff: any
    currency: string
    paymentLogic: 'pay_before' | 'pay_after'
    cart: Record<string, number>
    cartTotal: number
    isCartOpen: boolean
    manualType: 'dine_in' | 'takeaway' | 'delivery'
    manualTable: string
    manualName: string
    manualAddress: string
    onSetIsCartOpen: (v: boolean) => void
    onSetManualType: (v: 'dine_in' | 'takeaway' | 'delivery') => void
    onSetManualTable: (v: string) => void
    onSetManualName: (v: string) => void
    onSetManualAddress: (v: string) => void
    onUpdateCart: (dishId: string, delta: number) => void
    onUpdateOrderStatus: (id: string, status: string, isPaid?: boolean) => void
    onSubmit: () => Promise<void>
}

export default function CartDrawer({ categories, orders, staff, currency, paymentLogic, cart, cartTotal, isCartOpen, manualType, manualTable, manualName, manualAddress, onSetIsCartOpen, onSetManualType, onSetManualTable, onSetManualName, onSetManualAddress, onUpdateCart, onUpdateOrderStatus, onSubmit }: CartDrawerProps) {
    return (
        <div className={`fixed lg:relative inset-0 lg:inset-auto z-[100] lg:z-auto w-full lg:w-[480px] bg-white border-l shadow-2xl flex flex-col transition-transform duration-500 ${isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
            <header className="lg:hidden p-6 border-b flex justify-between items-center bg-zinc-50">
                <h3 className="font-black uppercase text-xs tracking-widest">Votre Panier</h3>
                <button onClick={() => onSetIsCartOpen(false)} className="p-2 bg-white rounded-xl shadow-sm"><X className="w-6 h-6" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10 no-scrollbar">
                <section><h3 className="hidden lg:flex font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-6 items-center gap-2"><ShoppingBag className="w-4 h-4 text-gold" /> Panier Vente</h3><div className="space-y-3">{categories.flatMap(c => c.dishes).filter(d => cart[d.id]).map(dish => (<div key={dish.id} className="bg-zinc-50 p-4 lg:p-5 rounded-2xl lg:rounded-[1.5rem] border border-zinc-100 flex items-center justify-between"><div className="flex-1 min-w-0"><p className="font-black text-zinc-900 text-xs lg:text-sm truncate">{dish.name}</p><p className="text-[10px] font-bold text-gold">{dish.price.toLocaleString()} {currency}</p></div><div className="flex items-center bg-white rounded-xl p-1 gap-2 shadow-sm"><button onClick={() => onUpdateCart(dish.id, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900"><Minus className="w-4 h-4" /></button><span className="w-4 text-center font-black text-xs">{cart[dish.id]}</span><button onClick={() => onUpdateCart(dish.id, 1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900"><Plus className="w-4 h-4" /></button></div></div>))}</div></section>

                {paymentLogic === 'pay_before' && orders.filter(o => !o.is_paid && o.production_status === 'RECEIVED').length > 0 && (
                    <section><h3 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp a encaisser</h3><div className="space-y-3">{orders.filter(o => !o.is_paid && o.production_status === 'RECEIVED').map(order => (<div key={order.id} className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm flex items-center justify-between animate-in slide-in-from-right-4">
                        <div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><p className="font-black text-zinc-900 text-sm truncate">{order.customer_name || 'Client'}</p><span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">{order.order_type === 'dine_in' ? 'Sur Place' : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</span></div><p className="text-[10px] font-bold text-emerald-600 uppercase">#{order.id.slice(0, 6)} - {order.total_price.toLocaleString()} {currency}</p></div>
                        <div className="flex gap-2">
                            {staff?.can_cancel_orders !== false && <button onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><XCircle className="w-5 h-5" /></button>}
                            {staff?.can_process_payments !== false && (
                                <button onClick={() => onUpdateOrderStatus(order.id, 'RECEIVED', true)} className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-2 transition-all"><CreditCard className="w-4 h-4" /> Encaisser</button>
                            )}
                        </div>
                    </div>))}</div></section>
                )}

                <section><h3 className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-blue-500" /> Pret a servir</h3><div className="space-y-3">{orders.filter(o => o.production_status === 'READY').map(order => (<div key={order.id} className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-center justify-between"><div><p className="font-black text-emerald-900 text-sm">{order.order_type === 'dine_in' ? `Table ${order.table_number}` : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</p><p className="text-[10px] font-bold text-emerald-600 uppercase">#{order.id.slice(0, 6)} - {order.total_price.toLocaleString()} {currency}</p></div>
                    <div className="flex gap-2">
                        {staff?.can_cancel_orders !== false && <button onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')} className="p-2 text-red-400 hover:bg-red-100 rounded-xl"><XCircle className="w-5 h-5" /></button>}
                        {staff?.can_process_payments !== false && (
                            <button onClick={() => onUpdateOrderStatus(order.id, 'SERVED', true)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-black/10">Encaisser</button>
                        )}
                    </div></div>))}</div></section>
            </div>
            <div className="p-6 lg:p-8 border-t bg-zinc-50/50 space-y-4 lg:space-y-6 shrink-0 pb-10 lg:pb-8">
                <div className="flex bg-white p-1 rounded-2xl border">
                    <button onClick={() => onSetManualType('dine_in')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'dine_in' ? 'bg-gold text-white shadow-lg' : 'text-zinc-400'}`}>Sur place</button>
                    <button onClick={() => onSetManualType('takeaway')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'takeaway' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400'}`}>Emporter</button>
                    <button onClick={() => onSetManualType('delivery')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'delivery' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400'}`}>Livraison</button>
                </div>
                <div className="space-y-2 lg:space-y-3">
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <input type="text" placeholder="Table" value={manualTable} onChange={e => onSetManualTable(e.target.value)} disabled={manualType !== 'dine_in'} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-center text-xs lg:text-base disabled:opacity-30 shadow-inner focus:bg-white transition-all" />
                        <input type="text" placeholder="Client" value={manualName} onChange={e => onSetManualName(e.target.value)} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-xs lg:text-base shadow-inner focus:bg-white transition-all" />
                    </div>
                    {manualType === 'delivery' && <input type="text" placeholder="Adresse de livraison..." value={manualAddress} onChange={e => onSetManualAddress(e.target.value)} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-xs lg:text-base shadow-inner focus:bg-white transition-all" />}
                </div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-400">Total</span><span className="text-2xl lg:text-3xl font-black text-blue-900">{cartTotal.toLocaleString()} {currency}</span></div>
                {staff?.can_validate_orders !== false && (
                    <button
                        disabled={cartTotal === 0}
                        onClick={onSubmit}
                        className={`w-full py-5 lg:py-6 text-white rounded-2xl lg:rounded-[2.5rem] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all ${paymentLogic === 'pay_before' ? 'bg-emerald-600' : 'bg-blue-600'}`}
                    >
                        {paymentLogic === 'pay_before' ? <><CreditCard className="w-5 h-5 lg:w-6 h-6" /> Encaisser</> : <><Send className="w-5 h-5 lg:w-6 h-6" /> Envoyer</>}
                    </button>
                )}
            </div>
        </div>
    )
}
