'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { MessageCircle, ShoppingBag, MapPin, Clock, User, Search, Filter, Loader2, TrendingUp, Coins, ChevronRight, LayoutDashboard, Calendar, QrCode, Heart, Eye, Star, CheckCircle2, XCircle, BarChart3, Utensils, ChefHat, Monitor, Bike, UtensilsCrossed, History, Download, X } from 'lucide-react'
import Image from 'next/image'

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [restaurant, setRestaurant] = useState<any>(null)
    const [currency, setCurrency] = useState('FCFA')
    const [searchQuery, setSearchQuery] = useState('')
    const [isAggregating, setIsAggregating] = useState(false)

    // Advanced Filters
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    const [filterSource, setFilterSource] = useState<'ALL' | 'POS' | 'WHATSAPP'>('ALL')
    const [filterType, setFilterType] = useState('ALL')
    const [filterStatus, setFilterStatus] = useState('ALL')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    // Modal & Export
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, dateStart, dateEnd, filterSource, filterType, filterStatus])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async (p = 1) => {
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/login'); return; }

            const { data: resData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', session.user.id)
                .single()

            if (!resData) return
            setRestaurant(resData)
            setCurrency(resData.currency || 'FCFA')

            const params = new URLSearchParams({
                page: p.toString(),
                limit: itemsPerPage.toString(),
                search: searchQuery,
                source: filterSource,
                type: filterType,
                status: filterStatus,
                dateStart,
                dateEnd
            })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard/${resData.id}?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors du chargement des statistiques")
        } finally {
            setLoading(false)
        }
    }

    const regenerateStats = async () => {
        try {
            setIsAggregating(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/aggregate`, {
                method: 'POST'
            })
            if (res.ok) {
                toast.success('Statistiques recalculées avec succès')
                loadData(1)
            } else {
                toast.error('Erreur lors du recalcul')
            }
        } catch (err) {
            console.error(err)
            toast.error('Erreur de connexion')
        } finally {
            setIsAggregating(false)
        }
    }

    useEffect(() => {
        loadData(currentPage)
    }, [currentPage, searchQuery, dateStart, dateEnd, filterSource, filterType, filterStatus])

    // Initial load handled by the useEffect above since currentPage defaults to 1

    const consolidatedOrders = data?.consolidatedOrders || []
    const totalOrders = data?.pagination?.total || 0
    const totalPages = Math.ceil(totalOrders / itemsPerPage)

    const downloadCSV = () => {
        const headers = ["ID", "Date", "Source", "Client", "Type", "Montant", "Statut", "Articles"]
        const rows = consolidatedOrders.map((o: any) => [
            o.id,
            new Date(o.created_at).toLocaleString(),
            o.source,
            o.customer_name || "Anonyme",
            o.order_type,
            o.total_price,
            o.current_status || o.status || o.production_status,
            o.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(' | ')
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `journal_ventes_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const typeIcon = (type: string) => {
        if (type === 'dine_in') return <UtensilsCrossed className="w-3 h-3" />
        if (type === 'takeaway') return <ShoppingBag className="w-3 h-3" />
        return <Bike className="w-3 h-3" />
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Tableau de Bord</h2>
                    <p className="text-zinc-500 mt-2 flex items-center gap-2 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Suivi complet du tunnel de vente
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={regenerateStats}
                        disabled={isAggregating}
                        className={`flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all font-bold text-sm shadow-lg disabled:opacity-50`}
                    >
                        {isAggregating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 text-[#c5a059]" />}
                        {isAggregating ? 'Calcul...' : 'Recalculer pour Aggregation'}
                    </button>
                    <button onClick={() => loadData(1)} className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all font-bold text-sm shadow-sm">
                        <Clock className="w-4 h-4 text-[#c5a059]" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* 1. KEY PERFORMANCE INDICATORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#064e3b] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                    <QrCode className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
                    <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Visites (Scans)</p>
                    <div className="text-4xl font-serif font-bold">{data?.qrScans || 0}</div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <Eye className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500 opacity-5" />
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Vues Plats</p>
                    <div className="text-4xl font-serif font-bold text-zinc-900">{data?.topViewedDishes?.reduce((s: number, d: any) => s + (d.views || 0), 0) || 0}</div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <Heart className="absolute -right-4 -bottom-4 w-24 h-24 text-red-500 opacity-5" />
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Favoris (Likes)</p>
                    <div className="text-4xl font-serif font-bold text-zinc-900">{data?.topLikedDishes?.reduce((s: number, d: any) => s + (d.likes || 0), 0) || 0}</div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <Coins className="absolute -right-4 -bottom-4 w-24 h-24 text-[#c5a059] opacity-5" />
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">CA Total (Confirmé)</p>
                    <div className="text-3xl font-serif font-bold text-[#064e3b]">
                        {((data?.orderStats?.totalRevenue || 0) + (data?.orderStats?.whatsappRevenue || 0)).toLocaleString()} {currency}
                    </div>
                </div>
            </div>

            {/* 1.5 VISITS TREND (Simple Timeline) */}
            {data?.qrScansByDate && data.qrScansByDate.length > 0 && (
                <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-8">
                        <Calendar className="w-5 h-5 text-[#c5a059]" />
                        Historique des Scans (Aggregé)
                    </h3>
                    <div className="flex items-end gap-2 h-48 overflow-x-auto no-scrollbar pt-4">
                        {data.qrScansByDate.map((day: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-[50px] group">
                                <span className="text-[8px] font-black text-[#c5a059] opacity-0 group-hover:opacity-100 transition-all">{day.count}</span>
                                <div
                                    className="w-full bg-emerald-500 rounded-t-xl transition-all hover:bg-[#c5a059] cursor-help"
                                    style={{ height: `${Math.max(8, (day.count / Math.max(...data.qrScansByDate.map((d: any) => d.count))) * 100)}%` }}
                                />
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter w-full text-center truncate px-1">
                                    {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. CONVERSION FUNNEL (The new tracking part) */}
            <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-10">
                    <BarChart3 className="w-6 h-6 text-[#c5a059]" />
                    Tracking des commandes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                        <MessageCircle className="w-8 h-8 text-emerald-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.emitted || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Émises (WhatsApp)</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <CheckCircle2 className="w-8 h-8 text-amber-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.validated || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Validées par Caisse</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <Utensils className="w-8 h-8 text-blue-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.served || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Servies (Terminées)</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-red-50 rounded-[2rem] border border-red-100">
                        <XCircle className="w-8 h-8 text-red-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.cancelled || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Annulées / Pertes</p>
                    </div>
                </div>
            </div>

            {/* 3. POPULAR CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-8"><Star className="w-5 h-5 text-[#c5a059]" /> Top Plats (Favoris)</h3>
                    <div className="space-y-4">
                        {data?.topLikedDishes?.slice(0, 5).map((dish: any, i: number) => (
                            <div key={dish.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <span className="text-xl font-serif font-bold text-zinc-200 italic w-6">{i + 1}</span>
                                <div className="flex-1 font-bold text-zinc-900 truncate text-sm">{dish.name}</div>
                                <div className="flex items-center gap-1.5 text-red-500 font-black text-xs bg-white px-3 py-1.5 rounded-xl border">
                                    <Heart className="w-3 h-3 fill-current" /> {dish.likes}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-8"><Eye className="w-5 h-5 text-blue-500" /> Top Plats (Vues)</h3>
                    <div className="space-y-4">
                        {data?.topViewedDishes?.slice(0, 5).map((dish: any, i: number) => (
                            <div key={dish.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <span className="text-xl font-serif font-bold text-zinc-200 italic w-6">{i + 1}</span>
                                <div className="flex-1 font-bold text-zinc-900 truncate text-sm">{dish.name}</div>
                                <div className="flex items-center gap-1.5 text-blue-500 font-black text-xs bg-white px-3 py-1.5 rounded-xl border">
                                    <Eye className="w-3 h-3" /> {dish.views}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. CONSOLIDATED SALES JOURNAL */}
            <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm">
                <div className="flex flex-col gap-10 mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-3">
                            <History className="w-6 h-6 text-[#c5a059]" />
                            Journal des Ventes Consolide
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-black bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 text-zinc-400">
                            {totalOrders} TRANSACTION(S) TOTALES
                        </div>
                    </div>

                    {/* Advanced Filter Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#fafafa] p-6 rounded-[2rem] border border-zinc-100">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Recherche</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <input type="text" placeholder="ID, Client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#c5a059] outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Période (Du/Au)</label>
                            <div className="flex gap-2">
                                <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="flex-1 px-3 py-2.5 bg-white border border-zinc-100 rounded-xl text-[10px] font-bold outline-none" />
                                <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="flex-1 px-3 py-2.5 bg-white border border-zinc-100 rounded-xl text-[10px] font-bold outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Source</label>
                            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                                <option value="ALL">Toutes Sources</option>
                                <option value="POS">Caisse POS</option>
                                <option value="WHATSAPP">WhatsApp</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Type Service</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                                <option value="ALL">Tous Types</option>
                                <option value="dine_in">Sur place</option>
                                <option value="takeaway">Emporter</option>
                                <option value="delivery">Livraison</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Statut</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer">
                                <option value="ALL">Tous Statuts</option>
                                <option value="pending">En attente / À préparer</option>
                                <option value="VALIDATED">Validés (WhatsApp)</option>
                                <option value="delivered">Servis (POS)</option>
                                <option value="CANCELLED">Annulés</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={downloadCSV}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button
                                onClick={() => { setSearchQuery(''); setDateStart(''); setDateEnd(''); setFilterSource('ALL'); setFilterType('ALL'); setFilterStatus('ALL'); }}
                                className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Effacer
                            </button>
                        </div>
                    </div>
                </div>

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
                                    onClick={() => setSelectedOrder(order)}
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
                                        {order.staff_name && <div className="text-[8px] font-black text-[#c5a059] uppercase tracking-tighter mt-1 flex items-center justify-end gap-1"><ChefHat className="w-2 h-2" /> {order.staff_name}</div>}
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
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-[#fdfdfd]">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-zinc-900">Détails Commande</h3>
                                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mt-1">Transaction #{selectedOrder.id.slice(0, 8)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                                <X className="w-5 h-5 text-zinc-600" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Source</p>
                                    <p className="text-xs font-bold flex items-center gap-2">
                                        {selectedOrder.source === 'WHATSAPP' ? <MessageCircle className="w-3 h-3 text-emerald-500" /> : <Monitor className="w-3 h-3 text-blue-500" />}
                                        {selectedOrder.source}
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Type</p>
                                    <p className="text-xs font-bold flex items-center gap-2">
                                        {typeIcon(selectedOrder.order_type)} {selectedOrder.order_type}
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Statut</p>
                                    <p className={`text-xs font-bold ${(selectedOrder.status || selectedOrder.production_status) === 'CANCELLED' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {selectedOrder.status || selectedOrder.production_status}
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date/Heure</p>
                                    <p className="text-[10px] font-bold">
                                        {new Date(selectedOrder.created_at).toLocaleDateString()} {new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                            <p className="font-bold text-zinc-900">{selectedOrder.customer_name || 'Client Anonyme'}</p>
                                            {selectedOrder.table_number && <p className="text-[10px] text-[#c5a059] font-black">TABLE {selectedOrder.table_number}</p>}
                                        </div>
                                    </div>
                                </div>
                                {selectedOrder.staff_name && (
                                    <div className="flex-1 space-y-2 border-l border-zinc-200 pl-6">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Personnel en Charge</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#c5a059]/10 rounded-full flex items-center justify-center"><ChefHat className="w-4 h-4 text-[#c5a059]" /></div>
                                            <p className="font-bold text-zinc-900">{selectedOrder.staff_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-[#c5a059]" /> Articles Commandés
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
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
                                                <p className="text-[10px] text-zinc-400 font-bold">{item.price.toLocaleString()} {currency} / unité</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#fdfdfd] border-t border-zinc-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Montant Total</span>
                                <span className="text-3xl font-serif font-bold text-[#064e3b]">{selectedOrder.total_price?.toLocaleString()} {currency}</span>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="px-8 py-3 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-xl">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
