'use client'

import { XCircle, MapPin, Printer, UtensilsCrossed, ShoppingBag, Bike } from 'lucide-react'

interface OrderCardProps {
    order: any
    staff: any
    paymentLogic: 'pay_before' | 'pay_after'
    onUpdateStatus: (id: string, status: string, isPaid?: boolean) => void
    onPrint: (order: any) => void
}

export const typeIcon = (type: string) => {
    if (type === 'dine_in') return <UtensilsCrossed className="w-3 h-3" />
    if (type === 'takeaway') return <ShoppingBag className="w-3 h-3" />
    return <Bike className="w-3 h-3" />
}

export default function OrderCard({ order, staff, paymentLogic, onUpdateStatus, onPrint }: OrderCardProps) {
    return (
        <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-zinc-100 shadow-sm p-5 lg:p-8 flex flex-col border-l-[8px] lg:border-l-[16px] transition-all hover:shadow-xl" style={{ borderLeftColor: order.order_type === 'dine_in' ? '#c5a059' : order.order_type === 'takeaway' ? '#1e293b' : '#3b82f6' }}>
            <div className="flex justify-between items-start mb-4 lg:mb-6"><div><div className="flex items-center gap-2 mb-1"><span className="font-black text-lg lg:text-2xl">#{order.id.slice(0, 6)}</span><span className="bg-zinc-50 text-zinc-700 text-[7px] lg:text-[8px] font-black uppercase px-1.5 py-0.5 rounded border flex items-center gap-1">{typeIcon(order.order_type)}</span></div><p className="text-[10px] lg:text-xs font-black text-zinc-900 uppercase tracking-widest truncate max-w-[120px]">{order.customer_name || 'Client'}</p></div><span className="text-[8px] lg:text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            {order.delivery_address && <div className="mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2"><MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 shrink-0 mt-0.5" /><p className="text-[9px] lg:text-[10px] font-bold text-blue-900 line-clamp-2">{order.delivery_address}</p></div>}
            <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 bg-zinc-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl">{order.items.map((item: any, idx: number) => (<div key={idx} className="flex flex-col gap-1"><div className="flex justify-between text-xs lg:text-sm"><span className="font-bold text-zinc-800"><span className="text-zinc-400 mr-2">{item.quantity}x</span> {item.name}</span></div>{item.note && <p className="text-[9px] italic text-gold bg-white p-2 rounded-xl border border-amber-100/50">"{item.note}"</p>}</div>))}</div>
            <div className="flex gap-2 lg:gap-3">
                {staff?.can_cancel_orders !== false && <button onClick={() => onUpdateStatus(order.id, 'CANCELLED')} className="p-3 lg:p-5 bg-red-50 text-red-500 rounded-xl lg:rounded-[1.5rem] hover:bg-red-100 transition-all"><XCircle className="w-5 h-5 lg:w-7 h-7" /></button>}
                <button onClick={() => onPrint(order)} className="p-3 lg:p-5 bg-zinc-100 text-zinc-900 rounded-xl lg:rounded-[1.5rem] hover:bg-zinc-200 transition-all"><Printer className="w-5 h-5 lg:w-7 h-7" /></button>
                {order.production_status === 'RECEIVED' ? <button onClick={() => onUpdateStatus(order.id, 'COOKING')} className="flex-1 py-4 lg:py-6 bg-blue-600 text-white rounded-xl lg:rounded-[1.5rem] font-black uppercase text-[10px] lg:text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 lg:gap-3">LANCER</button> : <button onClick={() => onUpdateStatus(order.id, paymentLogic === 'pay_before' ? 'SERVED' : 'READY')} className="flex-1 py-4 lg:py-6 bg-emerald-600 text-white rounded-xl lg:rounded-[1.5rem] font-black uppercase text-[10px] lg:text-xs shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 lg:gap-3">PRET</button>}
            </div>
        </div>
    )
}
