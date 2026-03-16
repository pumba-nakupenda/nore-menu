'use client'

import { Category } from '@/types'
import { X, Trash2, Tag } from 'lucide-react'
import { BADGE_ICONS } from '@/lib/constants'

export interface BadgeEditorProps {
    isOpen: boolean
    categories: Category[]
    selectedCategoryId: string | null
    lang: 'fr' | 'en'
    newBadgeName: string
    setNewBadgeName: (v: string) => void
    newBadgeNameEn: string
    setNewBadgeNameEn: (v: string) => void
    newBadgeIcon: string
    setNewBadgeIcon: (v: string) => void
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    onDeleteBadge: (badgeId: string) => void
}

export default function BadgeEditor({
    isOpen,
    categories,
    selectedCategoryId,
    lang,
    newBadgeName,
    setNewBadgeName,
    newBadgeNameEn,
    setNewBadgeNameEn,
    newBadgeIcon,
    setNewBadgeIcon,
    onClose,
    onSubmit,
    onDeleteBadge,
}: BadgeEditorProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center z-[150] p-0 lg:p-4 animate-in fade-in duration-300">
            <div className="bg-background p-6 lg:p-10 rounded-t-[2.5rem] lg:rounded-[3rem] w-full lg:max-w-lg h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl border-t lg:border border-white relative animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Filtres de <span className="text-brand italic">Categorie</span></h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                </div>

                <div className="mb-8 space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Filtres Actifs</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.find(c => c.id === selectedCategoryId)?.badges?.map(badge => {
                            const Icon = (BADGE_ICONS as any)[badge.icon] || Tag
                            return (
                                <div key={badge.id} className="relative group">
                                    <div className={`pl-3 pr-10 py-2 rounded-xl border flex items-center gap-2 ${badge.bg_color} ${badge.color} ${badge.border_color}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="font-bold text-[11px] uppercase tracking-tighter">{lang === 'en' ? (badge.name_en || badge.name) : badge.name}</span>
                                    </div>
                                    <button onClick={() => onDeleteBadge(badge.id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-red-500 text-white rounded-md shadow-md"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 pt-6 border-t border-black/5 pb-20">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-1">Creer un nouveau filtre</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" required placeholder="Nom (FR)" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} className="w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold shadow-sm" />
                        <input type="text" placeholder="Name (EN)" value={newBadgeNameEn} onChange={(e) => setNewBadgeNameEn(e.target.value)} className="w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold shadow-sm" />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {Object.keys(BADGE_ICONS).map(iconName => {
                            const Icon = (BADGE_ICONS as any)[iconName]
                            return (
                                <button key={iconName} type="button" onClick={() => setNewBadgeIcon(iconName)} className={`p-3 rounded-lg border transition-all flex items-center justify-center ${newBadgeIcon === iconName ? 'bg-brand text-white' : 'bg-white text-zinc-400'}`}><Icon className="w-4 h-4" /></button>
                            )
                        })}
                    </div>
                    <button type="submit" className="w-full py-4 bg-brand text-white rounded-xl font-bold shadow-xl shadow-emerald-900/10">Ajouter le Filtre</button>
                </form>
            </div>
        </div>
    )
}
