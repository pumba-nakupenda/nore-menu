'use client'

import { Search, MessageCircle, Monitor, ShoppingBag, Bike, UtensilsCrossed, ChefHat } from 'lucide-react'

interface SalesTableProps {
    consolidatedOrders: any[]
    totalOrders: number
    currentPage: number
    setCurrentPage: (fn: (prev: number) => number) => void
    itemsPerPage: number
    currency: string
    onSelectOrder: (order: any) => void
}

function typeIcon(type: string) {
    if (type === 'dine_in') return <UtensilsCrossed className="w-3 h-3" />
    if (type === 'takeaway') return <ShoppingBag className="w-3 h-3" />
    return <Bike className="w-3 h-3" />
}

export default function SalesTable({
    consolidatedOrders,
    totalOrders,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    currency,
    onSelectOrder
}: SalesTableProps) {
    const totalPages = Math.ceil(totalOrders / itemsPerPage)

    return (
        <>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="border-b border-zinc-100 italic">
                        <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                            <th className="px-6 py-4">Transaction</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Client / Type</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4 text-right">Montant</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {consolidatedOrders.map((order: any) => (
                            <tr
                                key={order.id}
                                onClick={() => onSelectOrder(order)}
                                className="hover:bg-[#fafafa] transition-colors group cursor-pointer"
                            >
                                <td className="px-6 py-6">
                                    <div className="font-black text-zinc-900 text-sm">#{order.id.toString().slice(0, 6)}</div>
                                    <div className="text-[10px] text-zinc-400 font-bold">{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-6 py-6 font-bold">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-tight ${order.source === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {order.source === 'WHATSAPP' ? <MessageCircle className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                                        {order.source}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="font-bold text-zinc-900 text-sm truncate max-w-[150px]">{order.customer_name || 'Anonyme'}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tight flex items-center gap-1">
                                            {typeIcon(order.order_type)} {order.order_type}
                                        </span>
                                        {order.table_number && <span className="text-[8px] bg-zinc-100 px-1.5 py-0.5 rounded font-black text-zinc-500">TAB {order.table_number}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                                        {order.items?.slice(0, 2).map((it: any, j: number) => (
                                            <span key={j} className="text-[9px] font-bold bg-white border border-zinc-100 px-2 py-0.5 rounded-lg text-zinc-500 whitespace-nowrap">
                                                {it.quantity}x {it.name}
                                            </span>
                                        ))}
                                        {order.items?.length > 2 && <span className="text-[9px] font-bold text-zinc-300">+{order.items.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="font-black text-zinc-900 text-sm">{order.total_price?.toLocaleString()} {currency}</div>
                                    {order.staff_name && <div className="text-[8px] font-black text-gold uppercase tracking-tighter mt-1 flex items-center justify-end gap-1"><ChefHat className="w-2 h-2" /> {order.staff_name}</div>}
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border tracking-tight ${(order.status || order.production_status) === 'SERVED' || (order.status || order.production_status) === 'VALIDATED'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : (order.status || order.production_status) === 'CANCELLED'
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {order.status || order.production_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {consolidatedOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                        <Search className="w-10 h-10" />
                                        <p className="font-black text-xs uppercase tracking-widest">Aucune transaction correspondante</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-10 pt-10 border-t border-zinc-100">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-black text-zinc-600 disabled:opacity-30 hover:bg-zinc-100 transition-all"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-black disabled:opacity-30 transition-all"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
