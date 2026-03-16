'use client'

import Image from 'next/image'
import { Category, Dish } from '@/types'
import { Plus, Trash2, Edit2, ImageIcon, Tag, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface SortableCategoryProps {
    category: Category
    t: (item: any, field: string) => string
    currency: string
    restaurantId: string | null
    openBadgeModal: (categoryId: string) => void
    openModal: (type: 'category' | 'dish', categoryId: string | null, itemToEdit?: any) => void
    handleDeleteCategory: (id: string) => void
    handleDeleteDish: (id: string) => void
}

export default function SortableCategory({ category, t, currency, restaurantId, openBadgeModal, openModal, handleDeleteCategory, handleDeleteDish }: SortableCategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as 'relative'
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-3 lg:gap-4 border-b border-black/5 pb-4 lg:pb-6">
                <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
                    <button {...attributes} {...listeners} className="p-2 -ml-2 text-zinc-300 hover:text-gold cursor-grab active:cursor-grabbing"><GripVertical className="w-5 h-5" /></button>
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="text-lg lg:text-2xl font-serif font-bold text-brand truncate uppercase">{t(category, 'name')}</h3><span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-widest">{category.dishes?.length || 0}</span></div></div>
                    <div className="flex gap-1">
                        <button onClick={() => openModal('category', null, category)} className="p-2 text-zinc-400 hover:text-brand rounded-lg bg-white border border-black/5"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-zinc-400 hover:text-red-500 rounded-lg bg-white border border-black/5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <button onClick={() => openBadgeModal(category.id)} className="flex-1 lg:flex-none text-zinc-600 text-[9px] font-black uppercase tracking-widest bg-white px-3 py-2.5 rounded-xl border border-black/5 shadow-sm flex items-center justify-center gap-2"><Tag className="w-3 h-3 text-gold" /> Filtres</button>
                    <button onClick={() => openModal('dish', category.id)} className="flex-1 lg:flex-none text-brand text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> Nouveau Plat</button>
                </div>
            </div>

            <div className="grid gap-3 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {category.dishes?.map((dish: Dish) => (
                    <div key={dish.id} className={`group relative bg-white rounded-2xl lg:rounded-[2rem] border border-black/5 transition-all duration-500 overflow-hidden flex flex-row lg:flex-col ${dish.is_available === false ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-2xl hover:shadow-emerald-900/5'}`}>
                        {/* Actions Overlay */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                            <button onClick={() => openModal('dish', category.id, dish)} className="text-brand bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-black/5 active:scale-90">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteDish(dish.id)} className="text-red-500 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-black/5 active:scale-90 lg:hidden">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="w-20 h-20 lg:w-full lg:aspect-[4/3] bg-zinc-50 overflow-hidden relative shrink-0">
                            {dish.image_url ? (
                                <Image src={dish.image_url} alt={dish.name} fill sizes="(max-width: 640px) 80px, 400px" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-200">
                                    <ImageIcon className="w-6 h-6 lg:w-16 lg:h-16" />
                                </div>
                            )}
                            <div className="absolute top-1 left-1 flex flex-col gap-1">
                                {dish.is_available === false && <span className="bg-zinc-900/80 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest shadow-lg">Masqué</span>}
                                {dish.is_sold_out && <span className="bg-red-600/90 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest shadow-lg">Rupture</span>}
                            </div>
                        </div>

                        <div className="p-3 lg:p-8 flex-1 flex flex-col min-w-0 justify-center lg:justify-start">
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-0.5 lg:mb-4 gap-0.5 lg:gap-1">
                                <h4 className="font-serif font-bold text-xs lg:text-xl text-zinc-900 leading-tight group-hover:text-brand transition-colors truncate w-full">{t(dish, 'name')}</h4>
                                <span className="text-brand font-black text-[10px] lg:text-lg whitespace-nowrap">{dish.price.toLocaleString()} {currency}</span>
                            </div>
                            <p className="text-zinc-500 text-[9px] lg:text-sm leading-snug line-clamp-1 lg:line-clamp-2 mb-1 lg:mb-6 font-medium">{t(dish, 'description')}</p>

                            {/* Tags */}
                            {dish.tags && dish.tags.length > 0 && (
                                <div className="mt-auto flex flex-wrap gap-1">
                                    {dish.tags.slice(0, 2).map((tag: string) => (
                                        <span key={tag} className="text-[6px] lg:text-[7px] font-black uppercase tracking-widest text-gold bg-amber-50 px-1 py-0.5 rounded-md border border-amber-100/50">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {(!category.dishes || category.dishes.length === 0) && (
                    <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-zinc-400 text-xs font-medium">Aucun plat dans cette catégorie.</p>
                        <button onClick={() => openModal('dish', category.id)} className="text-brand font-bold mt-2 text-xs hover:underline flex items-center justify-center mx-auto gap-2"><Plus className="w-3 h-3" /> Ajouter un plat</button>
                    </div>
                )}
            </div>
        </div>
    )
}
