'use client'

import Image from 'next/image'
import { X, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { DIETARY_TAGS } from '@/lib/constants'

export interface DishEditModalProps {
    isOpen: boolean
    editingItem: any | null
    modalType: 'category' | 'dish'
    newItemName: string
    setNewItemName: (v: string) => void
    newItemNameEn: string
    setNewItemNameEn: (v: string) => void
    newDishPrice: string
    setNewDishPrice: (v: string) => void
    newDishDesc: string
    setNewDishDesc: (v: string) => void
    newDishDescEn: string
    setNewDishDescEn: (v: string) => void
    newDishTags: string[]
    toggleTag: (tag: string) => void
    newDishAvailable: boolean
    setNewDishAvailable: (v: boolean) => void
    newDishSoldOut: boolean
    setNewDishSoldOut: (v: boolean) => void
    newDishSpecialty: boolean
    setNewDishSpecialty: (v: boolean) => void
    newDishImage: string | null
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    uploading: boolean
    currency: string
    lang: 'fr' | 'en'
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
}

export default function DishEditModal({
    isOpen,
    editingItem,
    modalType,
    newItemName,
    setNewItemName,
    newItemNameEn,
    setNewItemNameEn,
    newDishPrice,
    setNewDishPrice,
    newDishDesc,
    setNewDishDesc,
    newDishDescEn,
    setNewDishDescEn,
    newDishTags,
    toggleTag,
    newDishAvailable,
    setNewDishAvailable,
    newDishSoldOut,
    setNewDishSoldOut,
    newDishSpecialty,
    setNewDishSpecialty,
    newDishImage,
    handleImageChange,
    uploading,
    currency,
    lang,
    onClose,
    onSubmit,
}: DishEditModalProps) {
    if (!isOpen || modalType !== 'dish') return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center z-[150] p-0 lg:p-4 animate-in fade-in duration-300">
            <div className="bg-background p-6 lg:p-10 rounded-t-[2.5rem] lg:rounded-[3rem] w-full lg:max-w-lg h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl border-t lg:border border-white relative animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-start mb-6 lg:mb-8">
                    <div>
                        <h3 className="text-2xl lg:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
                            {editingItem ? 'Modifier' : 'Nouveau'} <span className="text-brand italic">Plat</span>
                        </h3>
                        <div className="w-12 h-1 bg-gold rounded-full mt-2"></div>
                    </div>
                    <button onClick={onClose} className="p-2 lg:p-3 hover:bg-zinc-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
                    <div className="grid grid-cols-3 gap-2 lg:gap-4">
                        <div className="flex flex-col items-center justify-center bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-black/5 shadow-sm gap-1 lg:gap-2">
                            <span className="text-[7px] lg:text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center">Visible</span>
                            <button
                                type="button"
                                onClick={() => setNewDishAvailable(!newDishAvailable)}
                                className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-300 relative ${newDishAvailable ? 'bg-brand' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-0.5 w-3 lg:w-4 h-3 lg:h-4 bg-white rounded-full transition-all duration-300 ${newDishAvailable ? 'left-4.5 lg:left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-black/5 shadow-sm gap-1 lg:gap-2">
                            <span className="text-[7px] lg:text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center">Stock</span>
                            <button
                                type="button"
                                onClick={() => setNewDishSoldOut(!newDishSoldOut)}
                                className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-300 relative ${newDishSoldOut ? 'bg-red-500' : 'bg-emerald-500'}`}
                            >
                                <div className={`absolute top-0.5 w-3 lg:w-4 h-3 lg:h-4 bg-white rounded-full transition-all duration-300 ${newDishSoldOut ? 'left-4.5 lg:left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-gold/30 shadow-sm gap-1 lg:gap-2">
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-2 h-2 text-gold" />
                                <span className="text-[7px] lg:text-[8px] font-black text-gold uppercase tracking-widest">Special</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNewDishSpecialty(!newDishSpecialty)}
                                className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-300 relative ${newDishSpecialty ? 'bg-brand' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-0.5 w-3 lg:w-4 h-3 lg:h-4 bg-white rounded-full transition-all duration-300 ${newDishSpecialty ? 'left-4.5 lg:left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Image du Plat</label>
                        <div
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="relative aspect-video rounded-3xl border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-brand group shadow-sm"
                        >
                            {newDishImage ? (
                                <Image src={newDishImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="text-center space-y-2">
                                    <ImageIcon className="text-zinc-200 w-10 h-10 mx-auto" />
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Uploader</p>
                                </div>
                            )}
                        </div>
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Prix ({currency})</label>
                        <input
                            type="number" required value={newDishPrice} onChange={(e) => setNewDishPrice(e.target.value)}
                            className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-brand outline-none transition-all font-bold shadow-sm"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description (FR)</label>
                            <textarea
                                value={newDishDesc} onChange={(e) => setNewDishDesc(e.target.value)}
                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-brand outline-none transition-all font-medium min-h-[80px] shadow-sm text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Etiquettes & Allergenes</label>
                        <div className="grid grid-cols-2 gap-2">
                            {DIETARY_TAGS.map(tag => (
                                <button
                                    key={tag.name} type="button" onClick={() => toggleTag(tag.name)}
                                    className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-3 font-bold text-[10px] uppercase ${newDishTags.includes(tag.name)
                                        ? 'bg-brand text-white border-brand shadow-lg'
                                        : 'bg-white text-zinc-500 border-black/5 hover:border-emerald-200'
                                        }`}
                                >
                                    <tag.icon className="w-3.5 h-3.5 text-gold" />
                                    {lang === 'en' ? (tag.name_en || tag.name) : tag.name}
                                </button>
                            ))}
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
