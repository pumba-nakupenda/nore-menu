'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Clock, Loader2, TrendingUp, History } from 'lucide-react'
import KPICards from '@/components/admin/analytics/KPICards'
import FilterBar from '@/components/admin/analytics/FilterBar'
import SalesTable from '@/components/admin/analytics/SalesTable'
import OrderDetailModal from '@/components/admin/analytics/OrderDetailModal'

export default function DashboardPage() {
    const router = useRouter()
    const { restaurantId, restaurant, token } = useAuth()
    const currency = restaurant?.currency || 'FCFA'
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAggregating, setIsAggregating] = useState(false)

    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    const [filterSource, setFilterSource] = useState<'ALL' | 'POS' | 'WHATSAPP'>('ALL')
    const [filterType, setFilterType] = useState('ALL')
    const [filterStatus, setFilterStatus] = useState('ALL')

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => { setCurrentPage(1) }, [searchQuery, dateStart, dateEnd, filterSource, filterType, filterStatus])
    useEffect(() => { if (restaurantId) loadData() }, [restaurantId])
    useEffect(() => { loadData(currentPage) }, [currentPage, searchQuery, dateStart, dateEnd, filterSource, filterType, filterStatus])

    const loadData = async (p = 1) => {
        if (!restaurantId || !token) return
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: p.toString(), limit: itemsPerPage.toString(), search: searchQuery,
                source: filterSource, type: filterType, status: filterStatus, dateStart, dateEnd
            })
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard/${restaurantId}?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) { const result = await response.json(); setData(result) }
        } catch (err) { toast.error("Erreur lors du chargement des statistiques") }
        finally { setLoading(false) }
    }

    const regenerateStats = async () => {
        try {
            setIsAggregating(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/aggregate`, { method: 'POST' })
            if (res.ok) { toast.success('Statistiques recalculées avec succès'); loadData(1) }
            else { toast.error('Erreur lors du recalcul') }
        } catch (err) { console.error(err); toast.error('Erreur de connexion') }
        finally { setIsAggregating(false) }
    }

    const consolidatedOrders = data?.consolidatedOrders || []
    const totalOrders = data?.pagination?.total || 0

    const downloadCSV = () => {
        const headers = ["ID", "Date", "Source", "Client", "Type", "Montant", "Statut", "Articles"]
        const rows = consolidatedOrders.map((o: any) => [
            o.id, new Date(o.created_at).toLocaleString(), o.source, o.customer_name || "Anonyme",
            o.order_type, o.total_price, o.current_status || o.status || o.production_status,
            o.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(' | ')
        ])
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.setAttribute("href", URL.createObjectURL(blob))
        link.setAttribute("download", `journal_ventes_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link)
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
                    <button onClick={regenerateStats} disabled={isAggregating} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all font-bold text-sm shadow-lg disabled:opacity-50">
                        {isAggregating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 text-gold" />}
                        {isAggregating ? 'Calcul...' : 'Recalculer pour Aggregation'}
                    </button>
                    <button onClick={() => loadData(1)} className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all font-bold text-sm shadow-sm">
                        <Clock className="w-4 h-4 text-gold" /> Actualiser
                    </button>
                </div>
            </div>

            <KPICards data={data} currency={currency} />

            {/* 4. CONSOLIDATED SALES JOURNAL */}
            <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm">
                <div className="flex flex-col gap-10 mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-3">
                            <History className="w-6 h-6 text-gold" />
                            Journal des Ventes Consolide
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-black bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 text-zinc-400">
                            {totalOrders} TRANSACTION(S) TOTALES
                        </div>
                    </div>
                    <FilterBar
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        dateStart={dateStart} setDateStart={setDateStart}
                        dateEnd={dateEnd} setDateEnd={setDateEnd}
                        filterSource={filterSource} setFilterSource={setFilterSource}
                        filterType={filterType} setFilterType={setFilterType}
                        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                        onDownloadCSV={downloadCSV}
                    />
                </div>
                <SalesTable
                    consolidatedOrders={consolidatedOrders} totalOrders={totalOrders}
                    currentPage={currentPage} setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage} currency={currency}
                    onSelectOrder={setSelectedOrder}
                />
            </div>

            {selectedOrder && <OrderDetailModal order={selectedOrder} currency={currency} onClose={() => setSelectedOrder(null)} />}
        </div>
    )
}
