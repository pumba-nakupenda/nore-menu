'use client'

import { X, Loader2 } from 'lucide-react'

export interface CategoryEditModalProps {
    isOpen: boolean
    editingItem: any | null
    modalType: 'category' | 'dish'
    newItemName: string
    setNewItemName: (v: string) => void
    newItemNameEn: string
    setNewItemNameEn: (v: string) => void
    uploading: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
}

export default function CategoryEditModal({
    isOpen,
    editingItem,
    modalType,
    newItemName,
    setNewItemName,
    newItemNameEn,
    setNewItemNameEn,
    uploading,
    onClose,
    onSubmit,
}: CategoryEditModalProps) {
    if (!isOpen || modalType !== 'category') return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center z-[150] p-0 lg:p-4 animate-in fade-in duration-300">
            <div className="bg-background p-6 lg:p-10 rounded-t-[2.5rem] lg:rounded-[3rem] w-full lg:max-w-lg h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl border-t lg:border border-white relative animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-start mb-6 lg:mb-8">
                    <div>
                        <h3 className="text-2xl lg:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
                            {editingItem ? 'Modifier' : 'Nouveau'} <span className="text-brand italic">Categorie</span>
                        </h3>
                        <div className="w-12 h-1 bg-gold rounded-full mt-2"></div>
                    </div>
                    <button onClick={onClose} className="p-2 lg:p-3 hover:bg-zinc-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nom (FR)</label>
                            <input
                                type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-brand outline-none transition-all font-bold shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Name (EN)</label>
                            <input
                                type="text" value={newItemNameEn} onChange={(e) => setNewItemNameEn(e.target.value)}
                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-brand outline-none transition-all font-bold shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 fixed bottom-0 left-0 right-0 p-6 bg-white border-t lg:static lg:bg-transparent lg:border-none lg:p-0">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-6 py-4 text-zinc-400 font-bold text-sm transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit" disabled={uploading}
                            className="flex-[2] px-6 py-4 bg-brand text-white rounded-2xl shadow-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? 'Mettre a jour' : 'Creer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
