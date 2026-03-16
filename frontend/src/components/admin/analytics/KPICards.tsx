'use client'

import { QrCode, Eye, Heart, Coins, Calendar, BarChart3, MessageCircle, CheckCircle2, Utensils, XCircle, Star } from 'lucide-react'

interface KPICardsProps {
    data: any
    currency: string
}

export default function KPICards({ data, currency }: KPICardsProps) {
    return (
        <>
            {/* 1. KEY PERFORMANCE INDICATORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
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
                    <Coins className="absolute -right-4 -bottom-4 w-24 h-24 text-gold opacity-5" />
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">CA Total (Confirme)</p>
                    <div className="text-3xl font-serif font-bold text-brand">
                        {((data?.orderStats?.totalRevenue || 0) + (data?.orderStats?.whatsappRevenue || 0)).toLocaleString()} {currency}
                    </div>
                </div>
            </div>

            {/* 1.5 VISITS TREND (Simple Timeline) */}
            {data?.qrScansByDate && data.qrScansByDate.length > 0 && (
                <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-8">
                        <Calendar className="w-5 h-5 text-gold" />
                        Historique des Scans (Agrege)
                    </h3>
                    <div className="flex items-end gap-2 h-48 overflow-x-auto no-scrollbar pt-4">
                        {data.qrScansByDate.map((day: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-[50px] group">
                                <span className="text-[8px] font-black text-gold opacity-0 group-hover:opacity-100 transition-all">{day.count}</span>
                                <div
                                    className="w-full bg-emerald-500 rounded-t-xl transition-all hover:bg-gold cursor-help"
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

            {/* 2. CONVERSION FUNNEL */}
            <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-10">
                    <BarChart3 className="w-6 h-6 text-gold" />
                    Tracking des commandes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                        <MessageCircle className="w-8 h-8 text-emerald-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.emitted || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Emises (WhatsApp)</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <CheckCircle2 className="w-8 h-8 text-amber-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.validated || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Validees par Caisse</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <Utensils className="w-8 h-8 text-blue-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.served || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Servies (Terminees)</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-red-50 rounded-[2rem] border border-red-100">
                        <XCircle className="w-8 h-8 text-red-500 mb-4" />
                        <div className="text-3xl font-black text-zinc-900">{data?.orderStats?.cancelled || 0}</div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">Annulees / Pertes</p>
                    </div>
                </div>
            </div>

            {/* 3. POPULAR CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-3 mb-8"><Star className="w-5 h-5 text-gold" /> Top Plats (Favoris)</h3>
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
        </>
    )
}
