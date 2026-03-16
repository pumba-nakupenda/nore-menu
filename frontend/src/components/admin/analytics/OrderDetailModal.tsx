'use client'

import { MessageCircle, Monitor, ShoppingBag, Bike, UtensilsCrossed, User, ChefHat, X } from 'lucide-react'

interface OrderDetailModalProps {
    order: any
    currency: string
    onClose: () => void
}

function typeIcon(type: string) {
    if (type === 'dine_in') return <UtensilsCrossed className="w-3 h-3" />
    if (type === 'takeaway') return <ShoppingBag className="w-3 h-3" />
    return <Bike className="w-3 h-3" />
}

export default function OrderDetailModal({ order, currency, onClose }: OrderDetailModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-[#fdfdfd]">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-zinc-900">Details Commande</h3>
                        <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mt-1">Transaction #{order.id.slice(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                        <X className="w-5 h-5 text-zinc-600" />
                    </button>
                </div>

                <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Source</p>
                            <p className="text-xs font-bold flex items-center gap-2">
                                {order.source === 'WHATSAPP' ? <MessageCircle className="w-3 h-3 text-emerald-500" /> : <Monitor className="w-3 h-3 text-blue-500" />}
                                {order.source}
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Type</p>
                            <p className="text-xs font-bold flex items-center gap-2">
                                {typeIcon(order.order_type)} {order.order_type}
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Statut</p>
                            <p className={`text-xs font-bold ${(order.status || order.production_status) === 'CANCELLED' ? 'text-red-500' : 'text-emerald-500'}`}>
                                {order.status || order.production_status}
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date/Heure</p>
                            <p className="text-[10px] font-bold">
                                {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* Client & Staff */}
                    <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#fafafa] rounded-[2rem] border border-zinc-100">
                        <div className="flex-1 space-y-2">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Informations Client</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full border border-zinc-100 flex items-center justify-center"><User className="w-4 h-4 text-zinc-400" /></div>
                                <div>
                                    <p className="font-bold text-zinc-900">{order.customer_name || 'Client Anonyme'}</p>
                                    {order.table_number && <p className="text-[10px] text-gold font-black">TABLE {order.table_number}</p>}
                                </div>
                            </div>
                        </div>
                        {order.staff_name && (
                            <div className="flex-1 space-y-2 border-l border-zinc-200 pl-6">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Personnel en Charge</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center"><ChefHat className="w-4 h-4 text-gold" /></div>
                                    <p className="font-bold text-zinc-900">{order.staff_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gold" /> Articles Commandes
                        </h4>
                        <div className="space-y-2">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:bg-white group">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                                            {item.variant && <p className="text-[10px] text-zinc-400 font-bold">{item.variant}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-zinc-900">{(item.price * item.quantity).toLocaleString()} {currency}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold">{item.price.toLocaleString()} {currency} / unite</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-[#fdfdfd] border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Montant Total</span>
                        <span className="text-3xl font-serif font-bold text-brand">{order.total_price?.toLocaleString()} {currency}</span>
                    </div>
                    <button onClick={onClose} className="px-8 py-3 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-xl">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}
