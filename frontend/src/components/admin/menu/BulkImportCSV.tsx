'use client'

import { X, Loader2, Check } from 'lucide-react'

export interface BulkImportCSVProps {
    isOpen: boolean
    importData: any[]
    loading: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function BulkImportCSV({
    isOpen,
    importData,
    loading,
    onClose,
    onConfirm,
}: BulkImportCSVProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[160] p-4 animate-in fade-in duration-300">
            <div className="bg-background p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Confirmer <span className="text-brand italic">l&apos;Import</span></h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-black/5 mb-8">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 border-b border-black/5"><tr><th className="px-4 py-3">Categorie</th><th className="px-4 py-3">Nom</th><th className="px-4 py-3">Prix</th></tr></thead>
                        <tbody className="divide-y divide-black/5 bg-white">{importData.map((row, idx) => (<tr key={idx}><td className="px-4 py-3 uppercase font-black text-[9px] text-brand">{row.category}</td><td className="px-4 py-3 font-bold">{row.name}</td><td className="px-4 py-3 font-black">{row.price.toLocaleString()}</td></tr>))}</tbody>
                    </table>
                </div>
                <button onClick={onConfirm} disabled={loading} className="w-full py-4 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Lancer l&apos;importation</button>
            </div>
        </div>
    )
}
