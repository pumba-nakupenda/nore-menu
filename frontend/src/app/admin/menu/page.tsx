'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Loader2, UtensilsCrossed, FileSpreadsheet, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useMenuForm } from '@/components/admin/menu/useMenuForm'
import SortableCategory from '@/components/admin/menu/SortableCategory'
import DishEditModal from '@/components/admin/menu/DishEditModal'
import CategoryEditModal from '@/components/admin/menu/CategoryEditModal'
import BadgeEditor from '@/components/admin/menu/BadgeEditor'
import BulkImportCSV from '@/components/admin/menu/BulkImportCSV'

export default function MenuPage() {
    const { restaurantId, restaurant, token } = useAuth()
    const currency = restaurant?.currency || 'FCFA'
    const [lang, setLang] = useState<'fr' | 'en'>('fr')

    const form = useMenuForm(restaurantId, token)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        if (restaurantId) form.loadMenu(restaurantId)
    }, [restaurantId])

    const t = (item: any, field: string) => {
        if (!item) return ''
        if (lang === 'en') {
            return item[`${field}_en`] || item[field]
        }
        return item[field]
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = form.categories.findIndex(c => c.id === active.id)
        const newIndex = form.categories.findIndex(c => c.id === over.id)

        const newOrder = arrayMove(form.categories, oldIndex, newIndex)
        form.setCategories(newOrder)

        try {
            const orders = newOrder.map((cat, index) => ({
                id: cat.id,
                order: index
            }))

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/reorder-categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orders })
            })
            toast.success('Ordre du menu mis à jour !')
        } catch (err) {
            toast.error('Erreur lors du changement d\'ordre')
        }
    }

    if (form.loading && !form.categories.length) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            <p className="font-medium animate-pulse">Chargement de votre menu premium...</p>
        </div>
    )

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-32">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-zinc-900 tracking-tight text-center md:text-left uppercase">Gestion du Menu</h2>
                    <p className="text-zinc-500 mt-1 text-[10px] md:text-base flex items-center justify-center md:justify-start gap-2 font-black uppercase tracking-widest opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                        Offre digitale premium
                    </p>
                </div>

                {/* SCROLLABLE TOOLBAR MOBILE */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                    <a
                        href={restaurantId ? `/menu/${restaurantId}` : '#'}
                        target="_blank"
                        className="whitespace-nowrap bg-emerald-50 text-brand border border-emerald-100 px-4 py-2.5 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Aperçu
                    </a>
                    <button
                        onClick={form.downloadTemplate}
                        className="whitespace-nowrap bg-white text-gold border border-gold/20 px-4 py-2.5 rounded-xl hover:bg-amber-50 flex items-center justify-center shadow-sm transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" /> Modèle
                    </button>
                    <button
                        onClick={() => document.getElementById('global-csv-import')?.click()}
                        className="whitespace-nowrap bg-white text-zinc-600 border border-black/5 px-4 py-2.5 rounded-xl hover:bg-zinc-50 flex items-center justify-center shadow-sm transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Import
                    </button>
                    <button
                        onClick={() => form.openModal('category')}
                        className="whitespace-nowrap bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand-dark flex items-center justify-center shadow-xl shadow-emerald-900/10 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Catégorie
                    </button>
                </div>
                <input type="file" id="global-csv-import" accept=".csv" onChange={form.handleFileImport} className="hidden" />
            </div>

            <div className="space-y-8 md:space-y-12">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={form.categories.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {form.categories.map((category) => (
                            <SortableCategory
                                key={category.id}
                                category={category}
                                t={t}
                                currency={currency}
                                restaurantId={restaurantId}
                                openBadgeModal={form.openBadgeModal}
                                openModal={form.openModal}
                                handleDeleteCategory={form.handleDeleteCategory}
                                handleDeleteDish={form.handleDeleteDish}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {form.categories.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10 shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <UtensilsCrossed className="w-10 h-10 text-brand" />
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Votre menu est vide</h4>
                        <button onClick={() => form.openModal('category')} className="bg-brand text-white px-8 py-4 rounded-2xl hover:bg-brand-dark transition-all font-bold shadow-xl">
                            Créer la première catégorie
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <DishEditModal
                isOpen={form.isModalOpen}
                editingItem={form.editingItem}
                modalType={form.modalType}
                newItemName={form.newItemName}
                setNewItemName={form.setNewItemName}
                newItemNameEn={form.newItemNameEn}
                setNewItemNameEn={form.setNewItemNameEn}
                newDishPrice={form.newDishPrice}
                setNewDishPrice={form.setNewDishPrice}
                newDishDesc={form.newDishDesc}
                setNewDishDesc={form.setNewDishDesc}
                newDishDescEn={form.newDishDescEn}
                setNewDishDescEn={form.setNewDishDescEn}
                newDishTags={form.newDishTags}
                toggleTag={form.toggleTag}
                newDishAvailable={form.newDishAvailable}
                setNewDishAvailable={form.setNewDishAvailable}
                newDishSoldOut={form.newDishSoldOut}
                setNewDishSoldOut={form.setNewDishSoldOut}
                newDishSpecialty={form.newDishSpecialty}
                setNewDishSpecialty={form.setNewDishSpecialty}
                newDishImage={form.newDishImage}
                handleImageChange={form.handleImageChange}
                uploading={form.uploading}
                currency={currency}
                lang={lang}
                onClose={() => form.setIsModalOpen(false)}
                onSubmit={form.handleSubmit}
            />

            <CategoryEditModal
                isOpen={form.isModalOpen}
                editingItem={form.editingItem}
                modalType={form.modalType}
                newItemName={form.newItemName}
                setNewItemName={form.setNewItemName}
                newItemNameEn={form.newItemNameEn}
                setNewItemNameEn={form.setNewItemNameEn}
                uploading={form.uploading}
                onClose={() => form.setIsModalOpen(false)}
                onSubmit={form.handleSubmit}
            />

            <BadgeEditor
                isOpen={form.isBadgeModalOpen}
                categories={form.categories}
                selectedCategoryId={form.selectedCategoryId}
                lang={lang}
                newBadgeName={form.newBadgeName}
                setNewBadgeName={form.setNewBadgeName}
                newBadgeNameEn={form.newBadgeNameEn}
                setNewBadgeNameEn={form.setNewBadgeNameEn}
                newBadgeIcon={form.newBadgeIcon}
                setNewBadgeIcon={form.setNewBadgeIcon}
                onClose={() => form.setIsBadgeModalOpen(false)}
                onSubmit={form.handleBadgeSubmit}
                onDeleteBadge={form.handleDeleteBadge}
            />

            <BulkImportCSV
                isOpen={form.isImportModalOpen}
                importData={form.importData}
                loading={form.loading}
                onClose={() => form.setIsImportModalOpen(false)}
                onConfirm={form.confirmBulkImport}
            />
        </div>
    )
}
