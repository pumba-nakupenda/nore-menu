'use client'

import { motion } from 'framer-motion'
import {
    Search,
    ShieldAlert,
    Clock,
    UserCheck,
    UserX
} from 'lucide-react'

interface ShopsTabProps {
    stats: any
    searchTerm: string
    setSearchTerm: (v: string) => void
    toggleApproval: (shopId: string, currentStatus: boolean) => void
}

export default function ShopsTab({ stats, searchTerm, setSearchTerm, toggleApproval }: ShopsTabProps) {
    const filteredShops = stats?.shops?.filter((s: any) => s.name?.toLowerCase().includes(searchTerm.toLowerCase())) || []
    const pendingShops = filteredShops.filter((s: any) => !s.is_approved && !s.is_master)
    const activeShops = filteredShops.filter((s: any) => s.is_approved || s.is_master)

    return (
        <motion.div key="shops" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* PENDING APPROVALS */}
            {pendingShops.length > 0 && (
                <section className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-red-600 flex items-center gap-3 ml-4">
                        <ShieldAlert className="w-6 h-6" /> En attente de validation ({pendingShops.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingShops.map((shop: any) => (
                            <div key={shop.id} className="bg-white p-8 rounded-[3rem] border-2 border-red-100 shadow-xl shadow-red-900/5 flex flex-col justify-between group">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Nouvelle inscription</p>
                                    <h4 className="text-2xl font-serif font-bold text-zinc-900 mb-4">{shop.name}</h4>
                                    <p className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Inscrit le {new Date(shop.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleApproval(shop.id, false)}
                                    className="w-full py-4 bg-brand text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                                >
                                    <UserCheck className="w-4 h-4" /> Valider l'acc&egrave;s
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ACTIVE SHOPS TABLE */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                    <h3 className="font-serif font-bold text-xl">Boutiques Actives</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand/10"
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-black/5">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Boutique</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {activeShops.map((shop: any) => (
                            <tr key={shop.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-8 py-6">
                                    <p className="font-bold text-zinc-900">{shop.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">Propriétaire: {shop.owner_id.slice(0,8)}...</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${shop.is_master ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                        {shop.is_master ? 'Master' : 'Validé'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {!shop.is_master && (
                                        <button
                                            onClick={() => toggleApproval(shop.id, true)}
                                            className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                                            title="Suspendre l'accès"
                                        >
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
