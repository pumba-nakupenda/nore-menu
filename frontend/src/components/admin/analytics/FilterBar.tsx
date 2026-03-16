'use client'

import { Search, Download } from 'lucide-react'

interface FilterBarProps {
    searchQuery: string
    setSearchQuery: (v: string) => void
    dateStart: string
    setDateStart: (v: string) => void
    dateEnd: string
    setDateEnd: (v: string) => void
    filterSource: 'ALL' | 'POS' | 'WHATSAPP'
    setFilterSource: (v: 'ALL' | 'POS' | 'WHATSAPP') => void
    filterType: string
    setFilterType: (v: string) => void
    filterStatus: string
    setFilterStatus: (v: string) => void
    onDownloadCSV: () => void
}

export default function FilterBar({
    searchQuery, setSearchQuery,
    dateStart, setDateStart,
    dateEnd, setDateEnd,
    filterSource, setFilterSource,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    onDownloadCSV
}: FilterBarProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#fafafa] p-6 rounded-[2rem] border border-zinc-100">
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Recherche</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input type="text" placeholder="ID, Client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-gold outline-none" />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Periode (Du/Au)</label>
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
                    <option value="pending">En attente / A preparer</option>
                    <option value="VALIDATED">Valides (WhatsApp)</option>
                    <option value="delivered">Servis (POS)</option>
                    <option value="CANCELLED">Annules</option>
                </select>
            </div>
            <div className="flex items-end gap-2">
                <button
                    onClick={onDownloadCSV}
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
    )
}
