'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Category, Dish } from '@/types'
import { Plus, Trash2, Edit2, Camera, X, ImageIcon, Tag, Leaf, Carrot, Beef, Flame, WheatOff, Medal, Fish, ShieldCheck, Heart, Star, Coffee, Wine, Beer, Pizza, Loader2, Search, Sprout, Milk, Egg, Shrimp, Martini, GlassWater, Cake, IceCream, Cookie, Clock, Zap, Sparkles, UtensilsCrossed, FileSpreadsheet, Download, GripVertical, Eye, ArrowUpRight, CheckCircle2, XCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
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
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { DIETARY_TAGS } from '@/lib/constants'

// Icon Mapping for Badge Creation
const BADGE_ICONS = {
    Leaf, Sprout, Carrot, Beef, Flame, WheatOff, Medal, Fish, Shrimp, ShieldCheck, Heart, Star, Sparkles, Zap, Clock, Coffee, Wine, Beer, Martini, GlassWater, Pizza, Cake, IceCream, Cookie, Milk, Egg
}

// Helper to fetch data
const fetchMenu = async (restaurantId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/menu/${restaurantId}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch menu')
    return res.json()
}

export default function MenuPage() {
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [currency, setCurrency] = useState('FCFA')
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'category' | 'dish'>('category')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [importData, setImportData] = useState<any[]>([])
    const [lang, setLang] = useState<'fr' | 'en'>('fr')
    const router = useRouter()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = categories.findIndex(c => c.id === active.id)
        const newIndex = categories.findIndex(c => c.id === over.id)

        const newOrder = arrayMove(categories, oldIndex, newIndex)
        setCategories(newOrder)

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
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

    const t = (item: any, field: string) => {
        if (!item) return ''
        if (lang === 'en') {
            return item[`${field}_en`] || item[field]
        }
        return item[field]
    }

    // Form states
    const [newItemName, setNewItemName] = useState('')
    const [newItemNameEn, setNewItemNameEn] = useState('')
    const [newDishPrice, setNewDishPrice] = useState('')
    const [newDishDesc, setNewDishDesc] = useState('')
    const [newDishDescEn, setNewDishDescEn] = useState('')
    const [newDishTags, setNewDishTags] = useState<string[]>([])
    const [newDishAvailable, setNewDishAvailable] = useState(true)
    const [newDishSoldOut, setNewDishSoldOut] = useState(false)
    const [newDishSpecialty, setNewDishSpecialty] = useState(false)
    const [newDishImage, setNewDishImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    // Badge Form States
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)
    const [newBadgeName, setNewBadgeName] = useState('')
    const [newBadgeNameEn, setNewBadgeNameEn] = useState('')
    const [newBadgeIcon, setNewBadgeIcon] = useState('Leaf')
    const [newBadgeColor, setNewBadgeColor] = useState('text-emerald-700')
    const [newBadgeBg, setNewBadgeBg] = useState('bg-emerald-50')
    const [newBadgeBorder, setNewBadgeBorder] = useState('border-emerald-100')

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id, currency')
                .eq('owner_id', user.id)
                .single()

            if (!restaurant) {
                router.push('/admin/onboarding')
                return
            }

            setRestaurantId(restaurant.id)
            setCurrency(restaurant.currency || 'FCFA')
            loadMenu(restaurant.id)
        }
        init()
    }, [])

    const loadMenu = async (id: string) => {
        setLoading(true)
        try {
            const data = await fetchMenu(id)
            setCategories(data.categories || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleTag = (tag: string) => {
        if (newDishTags.includes(tag)) {
            setNewDishTags(newDishTags.filter(t => t !== tag))
        } else {
            setNewDishTags([...newDishTags, tag])
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setNewDishImage(URL.createObjectURL(file))
        }
    }

    const uploadImage = async (file: File) => {
        try {
            setUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${restaurantId}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('dish-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('dish-images')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId) return

        try {
            setUploading(true)
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const isEditing = !!editingItem
            const method = isEditing ? 'PATCH' : 'POST'
            const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/menu/`

            let endpoint = modalType === 'category' ? 'category' : 'dish'
            if (isEditing) endpoint += `/${editingItem.id}`

            let finalImageUrl = newDishImage
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile)
                if (uploadedUrl) finalImageUrl = uploadedUrl
            }

            const priceValue = parseFloat(newDishPrice)
            const price = isNaN(priceValue) ? 0 : priceValue

            const body = modalType === 'category'
                ? { name: newItemName, name_en: newItemNameEn, restaurantId }
                : {
                    restaurantId,
                    categoryId: selectedCategoryId,
                    name: newItemName,
                    name_en: newItemNameEn,
                    price,
                    description: newDishDesc,
                    description_en: newDishDescEn,
                    tags: newDishTags,
                    image_url: finalImageUrl,
                    is_available: newDishAvailable,
                    is_sold_out: newDishSoldOut,
                    is_specialty: newDishSpecialty
                }

            const res = await fetch(baseUrl + endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.message || 'Failed to save item')
            }

            setIsModalOpen(false)
            resetForm()
            loadMenu(restaurantId)
            toast.success(isEditing ? 'Élément mis à jour !' : 'Élément ajouté !')
        } catch (err: any) {
            console.error('Error saving item:', err)
            toast.error(err.message || 'Erreur lors de la sauvegarde')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteDish = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce plat ?")) return
        const token = (await supabase.auth.getSession()).data.session?.access_token
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/dish/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (restaurantId) loadMenu(restaurantId)
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Supprimer une catégorie supprimera tous ses plats. Continuer ?")) return
        const token = (await supabase.auth.getSession()).data.session?.access_token
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/category/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (restaurantId) loadMenu(restaurantId)
    }

    const openModal = (type: 'category' | 'dish', categoryId: string | null = null, itemToEdit: any = null) => {
        setModalType(type)
        setSelectedCategoryId(categoryId)
        setEditingItem(itemToEdit)

        if (itemToEdit) {
            setNewItemName(itemToEdit.name)
            setNewItemNameEn(itemToEdit.name_en || '')
            if (type === 'dish') {
                setNewDishPrice(itemToEdit.price.toString())
                setNewDishDesc(itemToEdit.description || '')
                setNewDishDescEn(itemToEdit.description_en || '')
                setNewDishTags(itemToEdit.tags || [])
                setNewDishAvailable(itemToEdit.is_available ?? true)
                setNewDishSoldOut(itemToEdit.is_sold_out ?? false)
                setNewDishSpecialty(itemToEdit.is_specialty ?? false)
                setNewDishImage(itemToEdit.image_url || null)
            }
        } else {
            resetForm()
        }

        setIsModalOpen(true)
    }

    const resetForm = () => {
        setNewItemName('')
        setNewItemNameEn('')
        setNewDishPrice('')
        setNewDishDesc('')
        setNewDishDescEn('')
        setNewDishTags([])
        setNewDishAvailable(true)
        setNewDishSoldOut(false)
        setNewDishSpecialty(false)
        setNewDishImage(null)
        setImageFile(null)
        setEditingItem(null)
    }

    const resetBadgeForm = () => {
        setNewBadgeName('')
        setNewBadgeNameEn('')
        setNewBadgeIcon('Leaf')
        setNewBadgeColor('text-emerald-700')
        setNewBadgeBg('bg-emerald-50')
        setNewBadgeBorder('border-emerald-100')
    }

    const handleBadgeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId || !selectedCategoryId) return
        setLoading(true)

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const badge = {
                name: newBadgeName,
                name_en: newBadgeNameEn,
                icon: newBadgeIcon,
                color: newBadgeColor,
                bg_color: newBadgeBg,
                border_color: newBadgeBorder
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/badge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ restaurantId, categoryId: selectedCategoryId, badge })
            })

            if (!res.ok) throw new Error('Failed to save badge')

            setIsBadgeModalOpen(false)
            resetBadgeForm()
            loadMenu(restaurantId)
            toast.success('Filtre ajouté avec succès !')
        } catch (err: any) {
            console.error('Error saving badge:', err)
            toast.error(err.message || 'Erreur lors de la sauvegarde du filtre')
        } finally {
            setLoading(false)
        }
    }

    const downloadTemplate = () => {
        const data = [
            { category: "Burgers", name: "Le Classique", price: 4500, description: "Bœuf, cheddar, salade", image_url: "", tags: "Popular" }
        ];
        const csv = Papa.unparse(data);
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "nore_menu_blueprint.csv";
        link.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const formatted = results.data.map((row: any) => ({
                    category: row.category || 'Autres',
                    name: row.name,
                    name_en: row.name_en,
                    price: parseFloat(row.price) || 0,
                    description: row.description,
                    description_en: row.description_en,
                    image_url: row.image_url,
                    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : []
                }));
                setImportData(formatted);
                setIsImportModalOpen(true);
            }
        });
    };

    const confirmBulkImport = async () => {
        if (!restaurantId || importData.length === 0) return;
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/import-global`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ restaurantId, items: importData })
            });

            if (!res.ok) throw new Error('Global import failed');

            const result = await res.json();
            setIsImportModalOpen(false);
            setImportData([]);
            loadMenu(restaurantId);
            toast.success(`Importation réussie : ${result.importedCount} plats ajoutés.`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBadge = async (badgeId: string) => {
        if (!confirm('Voulez-vous supprimer ce filtre ?') || !restaurantId) return

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/badge/${badgeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            loadMenu(restaurantId)
        } catch (err) {
            console.error(err)
        }
    }

    const openBadgeModal = (categoryId: string) => {
        setSelectedCategoryId(categoryId)
        resetBadgeForm()
        setIsBadgeModalOpen(true)
    }

    if (loading && !categories.length) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
            <p className="font-medium animate-pulse">Chargement de votre menu premium...</p>
        </div>
    )

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-32">
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-zinc-900 tracking-tight text-center md:text-left uppercase">Gestion du Menu</h2>
                    <p className="text-zinc-500 mt-1 text-[10px] md:text-base flex items-center justify-center md:justify-start gap-2 font-black uppercase tracking-widest opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                        Offre digitale premium
                    </p>
                </div>
                
                {/* SCROLLABLE TOOLBAR MOBILE */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                    <a
                        href={restaurantId ? `/menu/${restaurantId}` : '#'}
                        target="_blank"
                        className="whitespace-nowrap bg-emerald-50 text-[#064e3b] border border-emerald-100 px-4 py-2.5 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Aperçu
                    </a>
                    <button
                        onClick={downloadTemplate}
                        className="whitespace-nowrap bg-white text-[#c5a059] border border-[#c5a059]/20 px-4 py-2.5 rounded-xl hover:bg-amber-50 flex items-center justify-center shadow-sm transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
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
                        onClick={() => openModal('category')}
                        className="whitespace-nowrap bg-[#064e3b] text-white px-5 py-2.5 rounded-xl hover:bg-[#053e2f] flex items-center justify-center shadow-xl shadow-emerald-900/10 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Catégorie
                    </button>
                </div>
                <input type="file" id="global-csv-import" accept=".csv" onChange={handleFileImport} className="hidden" />
            </div>

            <div className="space-y-8 md:space-y-12">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={categories.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {categories.map((category) => (
                            <SortableCategory
                                key={category.id}
                                category={category}
                                t={t}
                                currency={currency}
                                restaurantId={restaurantId}
                                openBadgeModal={openBadgeModal}
                                openModal={openModal}
                                handleDeleteCategory={handleDeleteCategory}
                                handleDeleteDish={handleDeleteDish}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {categories.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10 shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <UtensilsCrossed className="w-10 h-10 text-[#064e3b]" />
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Votre menu est vide</h4>
                        <button onClick={() => openModal('category')} className="bg-[#064e3b] text-white px-8 py-4 rounded-2xl hover:bg-[#053e2f] transition-all font-bold shadow-xl">
                            Créer la première catégorie
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center z-[150] p-0 lg:p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-6 lg:p-10 rounded-t-[2.5rem] lg:rounded-[3rem] w-full lg:max-w-lg h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl border-t lg:border border-white relative animate-in slide-in-from-bottom duration-500">
                        <div className="flex justify-between items-start mb-6 lg:mb-8">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
                                    {editingItem ? 'Modifier' : 'Nouveau'} <span className="text-[#064e3b] italic">{modalType === 'category' ? 'Catégorie' : 'Plat'}</span>
                                </h3>
                                <div className="w-12 h-1 bg-[#c5a059] rounded-full mt-2"></div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 lg:p-3 hover:bg-zinc-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
                            {modalType === 'dish' && (
                                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                                    <div className="flex flex-col items-center justify-center bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-black/5 shadow-sm gap-1 lg:gap-2">
                                        <span className="text-[7px] lg:text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center">Visible</span>
                                        <button
                                            type="button"
                                            onClick={() => setNewDishAvailable(!newDishAvailable)}
                                            className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-300 relative ${newDishAvailable ? 'bg-[#064e3b]' : 'bg-zinc-200'}`}
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
                                    <div className="flex flex-col items-center justify-center bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-[#c5a059]/30 shadow-sm gap-1 lg:gap-2">
                                        <div className="flex items-center gap-1">
                                            <Sparkles className="w-2 h-2 text-[#c5a059]" />
                                            <span className="text-[7px] lg:text-[8px] font-black text-[#c5a059] uppercase tracking-widest">Spécial</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewDishSpecialty(!newDishSpecialty)}
                                            className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full transition-all duration-300 relative ${newDishSpecialty ? 'bg-[#064e3b]' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 lg:w-4 h-3 lg:h-4 bg-white rounded-full transition-all duration-300 ${newDishSpecialty ? 'left-4.5 lg:left-5.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nom (FR)</label>
                                    <input
                                        type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Name (EN)</label>
                                    <input
                                        type="text" value={newItemNameEn} onChange={(e) => setNewItemNameEn(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                    />
                                </div>
                            </div>

                            {modalType === 'dish' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Image du Plat</label>
                                        <div
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            className="relative aspect-video rounded-3xl border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-[#064e3b] group shadow-sm"
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
                                            className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description (FR)</label>
                                            <textarea
                                                value={newDishDesc} onChange={(e) => setNewDishDesc(e.target.value)}
                                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-medium min-h-[80px] shadow-sm text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Étiquettes & Allergènes</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DIETARY_TAGS.map(tag => (
                                                <button
                                                    key={tag.name} type="button" onClick={() => toggleTag(tag.name)}
                                                    className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-3 font-bold text-[10px] uppercase ${newDishTags.includes(tag.name)
                                                        ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-lg'
                                                        : 'bg-white text-zinc-500 border-black/5 hover:border-emerald-200'
                                                        }`}
                                                >
                                                    <tag.icon className="w-3.5 h-3.5 text-[#c5a059]" />
                                                    {lang === 'en' ? (tag.name_en || tag.name) : tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-6 fixed bottom-0 left-0 right-0 p-6 bg-white border-t lg:static lg:bg-transparent lg:border-none lg:p-0">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 text-zinc-400 font-bold text-sm transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit" disabled={uploading}
                                    className="flex-[2] px-6 py-4 bg-[#064e3b] text-white rounded-2xl shadow-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? 'Mettre à jour' : 'Créer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BADGE MODAL */}
            {isBadgeModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center z-[150] p-0 lg:p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-6 lg:p-10 rounded-t-[2.5rem] lg:rounded-[3rem] w-full lg:max-w-lg h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl border-t lg:border border-white relative animate-in slide-in-from-bottom duration-500">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Filtres de <span className="text-[#064e3b] italic">Catégorie</span></h3>
                            <button onClick={() => setIsBadgeModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
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
                                            <button onClick={() => handleDeleteBadge(badge.id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-red-500 text-white rounded-md shadow-md"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleBadgeSubmit} className="space-y-6 pt-6 border-t border-black/5 pb-20">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] ml-1">Créer un nouveau filtre</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" required placeholder="Nom (FR)" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} className="w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold shadow-sm" />
                                <input type="text" placeholder="Name (EN)" value={newBadgeNameEn} onChange={(e) => setNewBadgeNameEn(e.target.value)} className="w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold shadow-sm" />
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {Object.keys(BADGE_ICONS).map(iconName => {
                                    const Icon = (BADGE_ICONS as any)[iconName]
                                    return (
                                        <button key={iconName} type="button" onClick={() => setNewBadgeIcon(iconName)} className={`p-3 rounded-lg border transition-all flex items-center justify-center ${newBadgeIcon === iconName ? 'bg-[#064e3b] text-white' : 'bg-white text-zinc-400'}`}><Icon className="w-4 h-4" /></button>
                                    )
                                })}
                            </div>
                            <button type="submit" className="w-full py-4 bg-[#064e3b] text-white rounded-xl font-bold shadow-xl shadow-emerald-900/10">Ajouter le Filtre</button>
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORT PREVIEW MODAL */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[160] p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Confirmer <span className="text-[#064e3b] italic">l'Import</span></h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-black/5 mb-8">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 border-b border-black/5"><tr><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Nom</th><th className="px-4 py-3">Prix</th></tr></thead>
                                <tbody className="divide-y divide-black/5 bg-white">{importData.map((row, idx) => (<tr key={idx}><td className="px-4 py-3 uppercase font-black text-[9px] text-[#064e3b]">{row.category}</td><td className="px-4 py-3 font-bold">{row.name}</td><td className="px-4 py-3 font-black">{row.price.toLocaleString()}</td></tr>))}</tbody>
                            </table>
                        </div>
                        <button onClick={confirmBulkImport} disabled={loading} className="w-full py-4 bg-[#064e3b] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Lancer l'importation</button>
                    </div>
                </div>
            )}
        </div>
    )
}

function SortableCategory({ category, t, currency, restaurantId, openBadgeModal, openModal, handleDeleteCategory, handleDeleteDish }: any) {
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
                    <button {...attributes} {...listeners} className="p-2 -ml-2 text-zinc-300 hover:text-[#c5a059] cursor-grab active:cursor-grabbing"><GripVertical className="w-5 h-5" /></button>
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="text-lg lg:text-2xl font-serif font-bold text-[#064e3b] truncate uppercase">{t(category, 'name')}</h3><span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-widest">{category.dishes?.length || 0}</span></div></div>
                    <div className="flex gap-1">
                        <button onClick={() => openModal('category', null, category)} className="p-2 text-zinc-400 hover:text-[#064e3b] rounded-lg bg-white border border-black/5"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-zinc-400 hover:text-red-500 rounded-lg bg-white border border-black/5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <button onClick={() => openBadgeModal(category.id)} className="flex-1 lg:flex-none text-zinc-600 text-[9px] font-black uppercase tracking-widest bg-white px-3 py-2.5 rounded-xl border border-black/5 shadow-sm flex items-center justify-center gap-2"><Tag className="w-3 h-3 text-[#c5a059]" /> Filtres</button>
                    <button onClick={() => openModal('dish', category.id)} className="flex-1 lg:flex-none text-[#064e3b] text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> Nouveau Plat</button>
                </div>
            </div>

            <div className="grid gap-3 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {category.dishes?.map((dish: Dish) => (
                    <div key={dish.id} className={`group relative bg-white rounded-2xl lg:rounded-[2rem] border border-black/5 transition-all duration-500 overflow-hidden flex flex-row lg:flex-col ${dish.is_available === false ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-2xl hover:shadow-emerald-900/5'}`}>
                        {/* Actions Overlay */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                            <button onClick={() => openModal('dish', category.id, dish)} className="text-[#064e3b] bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-black/5 active:scale-90">
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
                                <h4 className="font-serif font-bold text-xs lg:text-xl text-zinc-900 leading-tight group-hover:text-[#064e3b] transition-colors truncate w-full">{t(dish, 'name')}</h4>
                                <span className="text-[#064e3b] font-black text-[10px] lg:text-lg whitespace-nowrap">{dish.price.toLocaleString()} {currency}</span>
                            </div>
                            <p className="text-zinc-500 text-[9px] lg:text-sm leading-snug line-clamp-1 lg:line-clamp-2 mb-1 lg:mb-6 font-medium">{t(dish, 'description')}</p>
                            
                            {/* Tags */}
                            {dish.tags && dish.tags.length > 0 && (
                                <div className="mt-auto flex flex-wrap gap-1">
                                    {dish.tags.slice(0, 2).map((tag: string) => (
                                        <span key={tag} className="text-[6px] lg:text-[7px] font-black uppercase tracking-widest text-[#c5a059] bg-amber-50 px-1 py-0.5 rounded-md border border-amber-100/50">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {(!category.dishes || category.dishes.length === 0) && (
                    <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-zinc-400 text-xs font-medium">Aucun plat dans cette catégorie.</p>
                        <button onClick={() => openModal('dish', category.id)} className="text-[#064e3b] font-bold mt-2 text-xs hover:underline flex items-center justify-center mx-auto gap-2"><Plus className="w-3 h-3" /> Ajouter un plat</button>
                    </div>
                )}
            </div>
        </div>
    )
}