'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Clock, CheckCircle2, Utensils, PackageCheck, XCircle, Search, Filter, Loader2, Bell, MessageSquare, MapPin, ChevronRight, LayoutGrid, List, ShoppingBag, UtensilsCrossed, Trash2, ChefHat } from 'lucide-react'
import { toast } from 'sonner'

const COLUMNS = [
    { id: 'pending', title: 'À préparer', color: 'amber', bgColor: 'bg-amber-50', accentColor: 'bg-amber-500', borderColor: 'border-amber-100', textColor: 'text-amber-900' },
    { id: 'preparing', title: 'En cuisine', color: 'blue', bgColor: 'bg-blue-50', accentColor: 'bg-blue-500', borderColor: 'border-blue-100', textColor: 'text-blue-900' },
    { id: 'ready', title: 'Prêt', color: 'emerald', bgColor: 'bg-emerald-50', accentColor: 'bg-emerald-500', borderColor: 'border-emerald-100', textColor: 'text-emerald-900' },
    { id: 'delivered', title: 'Servi', color: 'zinc', bgColor: 'bg-zinc-50', accentColor: 'bg-zinc-500', borderColor: 'border-zinc-100', textColor: 'text-zinc-900' },
]

export default function AdminOrdersPage() {
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [showArchives, setShowArchives] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    // Track processed order IDs to prevent duplicate notifications
    const processedIds = useRef<Set<string>>(new Set())

    const stats = {
        totalRevenue: orders.filter(o => o.status === 'delivered' && new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.total_price, 0),
        activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
        todayCount: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length
    }

    useEffect(() => {
        const fetchUserRestaurant = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id)

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (restaurant) {
                setRestaurantId(restaurant.id)
            }
        }
        fetchUserRestaurant()
    }, [])

    useEffect(() => {
        if (restaurantId) {
            fetchOrders()

            // Realtime subscription
            const channel = supabase
                .channel('admin-orders')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `restaurant_id=eq.${restaurantId}`,
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            if (processedIds.current.has(payload.new.id)) return
                            processedIds.current.add(payload.new.id)

                            setOrders(prev => [payload.new, ...prev])
                            toast.success('Nouvelle commande reçue !', {
                                icon: <Bell className="w-4 h-4 text-emerald-500" />,
                                duration: 5000,
                            })
                            // Play notification sound
                            try {
                                const audio = new Audio('/notification.mp3')
                                audio.play().catch(e => console.error("Audio play blocked by browser policy:", e))
                            } catch (e) { }
                        } else if (payload.eventType === 'UPDATE') {
                            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
                        } else if (payload.eventType === 'DELETE') {
                            setOrders(prev => prev.filter(o => o.id !== payload.old.id))
                        }
                    }
                )
                .subscribe((status) => {
                    setIsOnline(status === 'SUBSCRIBED')
                })

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [restaurantId])

    const fetchOrders = async () => {
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${restaurantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch orders')
            const data = await res.json()
            setOrders(data)
            data.forEach((o: any) => processedIds.current.add(o.id))
        } catch (err) {
            toast.error('Erreur lors du chargement des commandes')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/pos-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, staffId: userId })
            })

            if (!res.ok) throw new Error('Failed to update status')
        } catch (err) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    const filteredOrders = orders.filter(order => {
        const isArchivedStatus = ['delivered', 'cancelled'].includes(order.status)
        const matchesArchive = showArchives ? isArchivedStatus : !isArchivedStatus

        const matchesSearch = !searchQuery ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.table_number && order.table_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.customer_phone && order.customer_phone.includes(searchQuery))

        return matchesArchive && matchesSearch
    })

    if (loading) return (
        <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
    )

    const OrderCard = ({ order }: { order: any }) => (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col p-4 mb-3 transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: order.order_type === 'dine_in' ? '#c5a059' : '#10b981' }}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm block">#{order.id.slice(0, 6)}</span>
                        {order.order_type === 'dine_in' ? (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-amber-100">
                                <UtensilsCrossed className="w-2.5 h-2.5" /> Sur place
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-emerald-100">
                                <ShoppingBag className="w-2.5 h-2.5" /> Emporter
                            </span>
                        )}
                    </div>
                    {order.customer_name && (
                        <p className="text-[10px] font-black text-zinc-900 truncate max-w-[150px]">{order.customer_name}</p>
                    )}
                    {order.customer_phone && (
                        <p className="text-[10px] font-bold text-zinc-400">{order.customer_phone}</p>
                    )}
                    {order.table_number && (
                        <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold">
                            <MapPin className="w-3 h-3" />
                            <span>Table {order.table_number}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {order.staff_accounts?.display_name && (
                        <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-tighter flex items-center gap-1">
                            <ChefHat className="w-2.5 h-2.5" /> {order.staff_accounts.display_name}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4 bg-zinc-50/50 p-3 rounded-xl border border-zinc-50">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-600 font-medium">
                                <span className="font-black text-zinc-900 mr-2">{item.quantity}x</span>
                                {item.name}
                            </span>
                        </div>
                        {item.note && (
                            <p className="text-[10px] italic text-[#c5a059] font-medium leading-tight">"{item.note}"</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-3 border-t border-zinc-50 flex items-center justify-between">
                <span className="font-black text-xs text-[#c5a059]">{order.total_price.toLocaleString()} FCFA</span>
                <div className="flex gap-1">
                    {order.status === 'pending' && (
                        <>
                            <button onClick={() => updateStatus(order.id, 'cancelled')} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><XCircle className="w-4 h-4" /></button>
                            <button onClick={() => updateStatus(order.id, 'preparing')} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-1">
                                PRÉPARER <ChevronRight className="w-3 h-3" />
                            </button>
                        </>
                    )}
                    {order.status === 'preparing' && (
                        <button onClick={() => updateStatus(order.id, 'ready')} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-1">
                            PRÊT <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button onClick={() => updateStatus(order.id, 'delivered')} className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-black rounded-lg hover:bg-black transition-colors shadow-lg shadow-black/20 flex items-center gap-1">
                            SERVI <CheckCircle2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Gestion des Commandes</h1>
                    <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Aujourd'hui</span>
                            <span className="bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-black px-2 py-0.5 rounded-lg border border-[#c5a059]/20">{stats.todayCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recettes</span>
                            <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/20">{stats.totalRevenue.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-tighter ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100 animate-pulse'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {isOnline ? 'Connecté' : 'Déconnecté'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => setShowArchives(!showArchives)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${showArchives ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'}`}
                    >
                        <Clock className="w-4 h-4" /> {showArchives ? 'Retour au flux' : 'Archives'}
                    </button>
                    <div className="h-8 w-[1px] bg-zinc-200 mx-2 hidden sm:block"></div>
                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            <List className="w-4 h-4" /> Liste
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher #"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[#c5a059]/10 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </header>

            {viewMode === 'kanban' ? (
                <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar h-[calc(100vh-240px)]">
                    {(showArchives
                        ? [
                            { id: 'delivered', title: 'Servi', color: 'zinc', bgColor: 'bg-zinc-50', accentColor: 'bg-zinc-500', borderColor: 'border-zinc-100', textColor: 'text-zinc-900' },
                            { id: 'cancelled', title: 'Annulé', color: 'red', bgColor: 'bg-red-50', accentColor: 'bg-red-500', borderColor: 'border-red-100', textColor: 'text-red-900' }
                        ]
                        : COLUMNS.filter(c => !['cancelled', 'delivered'].includes(c.id))
                    ).map(column => {
                        const columnOrders = filteredOrders.filter(o => o.status === column.id)
                        return (
                            <div key={column.id} className={`flex-shrink-0 w-80 flex flex-col ${column.bgColor} rounded-[2.5rem] border ${column.borderColor} p-5 shadow-sm`}>
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] ${column.textColor} flex items-center gap-2`}>
                                        <span className={`w-2.5 h-2.5 rounded-full ${column.accentColor} shadow-lg shadow-${column.color}-500/20`} />
                                        {column.title}
                                    </h3>
                                    <span className="bg-white/80 backdrop-blur-sm border border-black/5 text-zinc-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                                        {columnOrders.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                                    {columnOrders.map(order => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                    {columnOrders.length === 0 && (
                                        <div className="h-32 rounded-[2rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center bg-white/20 gap-2">
                                            <Utensils className="w-6 h-6 text-zinc-200" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Aucune commande</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    )
}
