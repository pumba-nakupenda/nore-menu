'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp,
    Target,
    Store,
    QrCode,
    Zap
} from 'lucide-react'

function KpiCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 space-y-4 shadow-sm">
            <div className={`w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p><p className="text-3xl font-serif font-bold text-zinc-900">{value ?? '...'}</p></div>
        </div>
    )
}

interface AnalyticsTabProps {
    stats: any
    conversionRate: number
}

export default function AnalyticsTab({ stats, conversionRate }: AnalyticsTabProps) {
    return (
        <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="Chiffre d'Affaire" value={`${stats?.totalRevenue?.toLocaleString()} FCFA`} icon={TrendingUp} color="text-emerald-600" />
                <KpiCard label="Conversion" value={`${conversionRate.toFixed(1)}%`} icon={Target} color="text-[#b48a4d]" />
                <KpiCard label="Restaurants" value={stats?.totalRestaurants} icon={Store} color="text-zinc-900" />
                <KpiCard label="Scans Totaux" value={stats?.totalScans} icon={QrCode} color="text-blue-600" />
            </div>
            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-8">
                    <h3 className="text-xl font-serif font-bold italic">Top Performance Boutiques</h3>
                    <div className="space-y-4">
                        {stats?.topShops?.map((shop: any, i: number) => (
                            <div key={shop.id} className="flex items-center justify-between p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100/50 hover:border-[#b48a4d]/20 transition-all">
                                <div className="flex items-center gap-6"><span className="text-xl font-serif font-bold opacity-20">0{i + 1}</span><p className="font-bold">{shop.name}</p></div>
                                <p className="font-black text-brand">{shop.revenue.toLocaleString()} FCFA</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-8">
                        <h3 className="text-lg font-serif font-bold italic text-center text-zinc-400 uppercase tracking-widest">Croissance Hebdo</h3>
                        <div className="h-40 flex items-end gap-3 px-2">
                            {[40, 70, 55, 90, 65, 80, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-zinc-50 rounded-t-xl relative group">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-brand/10 group-hover:bg-brand/20 transition-colors rounded-t-xl" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase text-zinc-300 px-2">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
                        </div>
                    </div>
                    <div className="bg-brand p-10 rounded-[3rem] text-white space-y-4 shadow-xl">
                        <Zap className="w-6 h-6 text-[#b48a4d]" />
                        <h4 className="text-2xl font-serif font-bold italic leading-tight">Vitalité Plateforme</h4>
                        <p className="text-sm opacity-60">{stats?.totalDishes} plats actifs.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
