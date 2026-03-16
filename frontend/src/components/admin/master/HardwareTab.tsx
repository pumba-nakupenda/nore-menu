'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
    Plus,
    Trash2,
    Upload,
    Loader2
} from 'lucide-react'

function Input({ label, value, onChange }: { label: string, value: any, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-[0.1em]">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 ring-brand/5 transition-all" />
        </div>
    )
}

interface HardwareTabProps {
    hardwareItems: any[]
    setHardwareItems: (items: any[]) => void
    uploadingIdx: string | number | null
    handleHardwareSave: (item: any) => void
    deleteHardware: (id: any) => void
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void, identifier: string | number) => void
}

export default function HardwareTab({ hardwareItems, setHardwareItems, uploadingIdx, handleHardwareSave, deleteHardware, handleFileUpload }: HardwareTabProps) {
    return (
        <motion.div key="hardware" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="col-span-full flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-black/5">
                <h2 className="text-xl font-serif font-bold">Gestion Catalogue Réel</h2>
                <button onClick={() => setHardwareItems([{id: Math.random(), title: "Nouveau", price: 0, tag: "Signature", image_url: "", description: "", is_active: true}, ...hardwareItems])} className="px-8 py-3 bg-brand text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
            </div>
            {hardwareItems.map((item, idx) => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-black/5 space-y-6 relative shadow-sm">
                    <button onClick={() => deleteHardware(item.id)} className="absolute top-6 right-6 p-2 text-red-400 opacity-0 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Titre" value={item.title} onChange={(v: string) => { const n = [...hardwareItems]; n[idx].title = v; setHardwareItems(n); }} />
                        <Input label="Prix" value={item.price} onChange={(v: string) => { const n = [...hardwareItems]; n[idx].price = v; setHardwareItems(n); }} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image URL / Upload</label>
                        <div className="flex gap-4">
                            <input type="text" value={item.image_url} onChange={(e) => { const n = [...hardwareItems]; n[idx].image_url = e.target.value; setHardwareItems(n); }} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs" />
                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                {uploadingIdx === item.id ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hardware', (url) => { const n = [...hardwareItems]; n[idx].image_url = url; setHardwareItems(n); }, item.id)} />
                            </label>
                        </div>
                    </div>
                    <div className="aspect-video relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                        {item.image_url && <Image src={item.image_url} alt="Preview" fill className="object-cover" unoptimized />}
                    </div>
                    <button onClick={() => handleHardwareSave(item)} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Enregistrer Produit</button>
                </div>
            ))}
        </motion.div>
    )
}
