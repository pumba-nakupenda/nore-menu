'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, MapPin, MessageCircle, User, Check } from 'lucide-react'
import { toast } from 'sonner'
import { typeIcon } from './OrderCard'

interface WhatsAppPanelProps {
    whatsappOrders: any[]
    staff: any
    currency: string
    loading: boolean
    setLoading: (v: boolean) => void
    onUpdateWhatsAppStatus: (id: string, status: 'VALIDATED' | 'CANCELLED', deliveryData?: any) => Promise<void>
    onUpdateWhatsAppPayment: (id: string, isPaid: boolean) => Promise<void>
}

export default function WhatsAppPanel({ whatsappOrders, staff, currency, loading, setLoading, onUpdateWhatsAppStatus, onUpdateWhatsAppPayment }: WhatsAppPanelProps) {
    const [confirmingOrder, setConfirmingOrder] = useState<any>(null)
    const [customerName, setCustomerName] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')

    const handleConfirmWhatsApp = async () => {
        if (!confirmingOrder) return
        setLoading(true)
        try {
            await onUpdateWhatsAppStatus(confirmingOrder.id, 'VALIDATED', {
                customerName: customerName || 'Client WhatsApp',
                deliveryAddress: deliveryAddress
            })
            toast.success('Commande validee et envoyee en cuisine !')
            setConfirmingOrder(null)
            setCustomerName('')
            setDeliveryAddress('')
        } catch (error) {
            toast.error('Erreur lors de la validation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="absolute inset-0 p-4 lg:p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {whatsappOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-zinc-100 p-5 lg:p-8 shadow-sm flex flex-col hover:border-emerald-200 transition-all">
                            <div className="flex justify-between items-start mb-4 lg:mb-6">
                                <div><span className="font-black text-zinc-900 block text-base lg:text-lg">#{order.id.slice(0, 6)}</span><p className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[100px]">{order.customer_name || 'WhatsApp'}</p></div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="bg-emerald-50 text-emerald-700 text-[7px] lg:text-[8px] font-black px-1.5 lg:px-2 py-0.5 lg:py-1 rounded border border-emerald-100 uppercase tracking-widest flex items-center gap-1">{typeIcon(order.order_type)} {order.order_type === 'dine_in' ? 'Sur Place' : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</span>
                                    {order.table_number && <span className="text-[9px] lg:text-[10px] font-black text-zinc-900">Table {order.table_number}</span>}
                                </div>
                            </div>
                            {order.delivery_address && <div className="mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2"><MapPin className="w-3.5 h-3.5 lg:w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><p className="text-[9px] lg:text-[10px] font-bold text-blue-900 line-clamp-2">{order.delivery_address}</p></div>}
                            <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 flex-1 bg-zinc-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl">{order.items.map((item: any, i: number) => (<p key={i} className="text-xs lg:text-sm text-zinc-600 font-bold"><span className="font-black text-zinc-900 mr-2">{item.quantity}x</span> {item.name}</p>))}</div>
                            <div className="flex items-center justify-between pt-4 lg:pt-6 border-t border-zinc-50">
                                <span className="text-xl lg:text-2xl font-black text-emerald-600">{order.total_price.toLocaleString()} {currency}</span>
                                {order.status === 'PENDING' ? (
                                    <div className="flex gap-2">
                                        {staff?.can_cancel_orders !== false && (
                                            <button onClick={() => onUpdateWhatsAppStatus(order.id, 'CANCELLED')} className="p-2.5 lg:p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all"><XCircle className="w-5 h-5 lg:w-6 h-6" /></button>
                                        )}
                                        {staff?.can_validate_orders !== false && (
                                            <button
                                                onClick={() => {
                                                    setConfirmingOrder(order);
                                                    setCustomerName(order.customer_name || '');
                                                    setDeliveryAddress(order.delivery_address || '');
                                                }}
                                                className="bg-emerald-500 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-black uppercase text-[10px] lg:text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 h-4" /> Confirmer
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 items-end">
                                        <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${order.status === 'VALIDATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{order.status === 'VALIDATED' ? 'Validee' : 'Annulee'}</span>
                                        {order.status === 'VALIDATED' && (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${order.is_paid ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{order.is_paid ? 'Paye' : 'Non Paye'}</span>
                                                <button onClick={() => onUpdateWhatsAppPayment(order.id, !order.is_paid)} className={`px-4 py-2 rounded-xl font-black uppercase text-[8px] flex items-center gap-1.5 transition-all ${order.is_paid ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                                    {order.is_paid ? '\u2715 Non Paye' : '\u2713 Paye'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL CONFIRMATION WHATSAPP / LIVRAISON */}
            {confirmingOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingOrder(null)} />
                    <div className="relative bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-pop-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 uppercase">Confirmer la Commande</h2>
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">#{confirmingOrder.id.slice(0, 6)} - WhatsApp</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Nom du Client</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Ex: Samba Ndiaye"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Adresse de Livraison</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Ex: Rue 10, Immeuble Nore, Dakar"
                                        value={deliveryAddress}
                                        onChange={e => setDeliveryAddress(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <p className="text-[9px] text-zinc-400 italic ml-2">Laissez vide si c'est une commande sur place ou a emporter.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmingOrder(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">Annuler</button>
                            <button
                                onClick={handleConfirmWhatsApp}
                                className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-black transition-all"
                            >
                                <Check className="w-4 h-4" /> Envoyer en Cuisine
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
