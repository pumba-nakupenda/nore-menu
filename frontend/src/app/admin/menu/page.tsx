'use client'

import { Plus, Loader2, UtensilsCrossed, FileSpreadsheet, Download, Eye } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
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
    const menu = useMenuForm()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    if (menu.loading && !menu.categories.length) return (
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
                        href={menu.restaurantId ? `/menu/${menu.restaurantId}` : '#'}
                        target="_blank"
                        className="whitespace-nowrap bg-emerald-50 text-brand border border-emerald-100 px-4 py-2.5 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Aperçu
                    </a>
                    <button
                        onClick={menu.downloadTemplate}
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
                        onClick={() => menu.openModal('category')}
                        className="whitespace-nowrap bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand-dark flex items-center justify-center shadow-xl shadow-emerald-900/10 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Catégorie
                    </button>
                </div>
                <input type="file" id="global-csv-import" accept=".csv" onChange={menu.handleFileImport} className="hidden" />
            </div>

            <div className="space-y-8 md:space-y-12">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={menu.handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={menu.categories.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {menu.categories.map((category) => (
                            <SortableCategory
                                key={category.id}
                                category={category}
                                t={menu.t}
                                currency={menu.currency}
                                restaurantId={menu.restaurantId}
                                openBadgeModal={menu.openBadgeModal}
                                openModal={menu.openModal}
                                handleDeleteCategory={menu.handleDeleteCategory}
                                handleDeleteDish={menu.handleDeleteDish}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {menu.categories.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10 shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <UtensilsCrossed className="w-10 h-10 text-brand" />
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Votre menu est vide</h4>
                        <button onClick={() => menu.openModal('category')} className="bg-brand text-white px-8 py-4 rounded-2xl hover:bg-brand-dark transition-all font-bold shadow-xl">
                            Créer la première catégorie
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <DishEditModal
                isOpen={menu.isModalOpen}
                editingItem={menu.editingItem}
                modalType={menu.modalType}
                newItemName={menu.newItemName}
                setNewItemName={menu.setNewItemName}
                newItemNameEn={menu.newItemNameEn}
                setNewItemNameEn={menu.setNewItemNameEn}
                newDishPrice={menu.newDishPrice}
                setNewDishPrice={menu.setNewDishPrice}
                newDishDesc={menu.newDishDesc}
                setNewDishDesc={menu.setNewDishDesc}
                newDishDescEn={menu.newDishDescEn}
                setNewDishDescEn={menu.setNewDishDescEn}
                newDishTags={menu.newDishTags}
                toggleTag={menu.toggleTag}
                newDishAvailable={menu.newDishAvailable}
                setNewDishAvailable={menu.setNewDishAvailable}
                newDishSoldOut={menu.newDishSoldOut}
                setNewDishSoldOut={menu.setNewDishSoldOut}
                newDishSpecialty={menu.newDishSpecialty}
                setNewDishSpecialty={menu.setNewDishSpecialty}
                newDishImage={menu.newDishImage}
                handleImageChange={menu.handleImageChange}
                uploading={menu.uploading}
                currency={menu.currency}
                lang={menu.lang}
                onClose={() => menu.setIsModalOpen(false)}
                onSubmit={menu.handleSubmit}
            />

            <CategoryEditModal
                isOpen={menu.isModalOpen}
                editingItem={menu.editingItem}
                modalType={menu.modalType}
                newItemName={menu.newItemName}
                setNewItemName={menu.setNewItemName}
                newItemNameEn={menu.newItemNameEn}
                setNewItemNameEn={menu.setNewItemNameEn}
                uploading={menu.uploading}
                onClose={() => menu.setIsModalOpen(false)}
                onSubmit={menu.handleSubmit}
            />

            <BadgeEditor
                isOpen={menu.isBadgeModalOpen}
                categories={menu.categories}
                selectedCategoryId={menu.selectedCategoryId}
                lang={menu.lang}
                newBadgeName={menu.newBadgeName}
                setNewBadgeName={menu.setNewBadgeName}
                newBadgeNameEn={menu.newBadgeNameEn}
                setNewBadgeNameEn={menu.setNewBadgeNameEn}
                newBadgeIcon={menu.newBadgeIcon}
                setNewBadgeIcon={menu.setNewBadgeIcon}
                onClose={() => menu.setIsBadgeModalOpen(false)}
                onSubmit={menu.handleBadgeSubmit}
                onDeleteBadge={menu.handleDeleteBadge}
            />

            <BulkImportCSV
                isOpen={menu.isImportModalOpen}
                importData={menu.importData}
                loading={menu.loading}
                onClose={() => menu.setIsImportModalOpen(false)}
                onConfirm={menu.confirmBulkImport}
            />
        </div>
    )
}
