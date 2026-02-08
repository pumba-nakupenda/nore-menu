'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Category, Dish } from '@/types'
import { Plus, Trash2, Edit2, Camera, X, ImageIcon, Tag, Leaf, Carrot, Beef, Flame, WheatOff, Medal, Fish, ShieldCheck, Heart, Star, Coffee, Wine, Beer, Pizza, Loader2, Search, Sprout, Milk, Egg, Shrimp, Martini, GlassWater, Cake, IceCream, Cookie, Clock, Zap, Sparkles, UtensilsCrossed, FileSpreadsheet, Download, GripVertical, Eye, ArrowUpRight } from 'lucide-react'
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
    console.log('Fetching menu from:', url)
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

        // Sync with backend
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
            toast.success('Menu order updated!')
        } catch (err) {
            toast.error('Failed to save new order')
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
            toast.success(isEditing ? 'Item updated!' : 'Item added!')
        } catch (err: any) {
            console.error('Error saving item:', err)
            toast.error(err.message || 'Failed to save item')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteDish = async (id: string) => {
        if (!confirm("Are you sure?")) return
        const token = (await supabase.auth.getSession()).data.session?.access_token
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/dish/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (restaurantId) loadMenu(restaurantId)
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Deleting a category will delete all its dishes. Proceed?")) return
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
            toast.success('Badge added successfully!')
        } catch (err: any) {
            console.error('Error saving badge:', err)
            toast.error(err.message || 'Failed to save badge')
        } finally {
            setLoading(false)
        }
    }

    const downloadTemplate = () => {
        const data = [
            {
                category: "Burgers",
                name: "Le Classique",
                name_en: "The Classic",
                price: 4500,
                description: "Bœuf, cheddar, salade, tomates",
                description_en: "Beef, cheddar, lettuce, tomatoes",
                image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000",
                tags: "Popular"
            },
            {
                category: "Burgers",
                name: "Le Piquant",
                name_en: "The Spicy",
                price: 5000,
                description: "Bœuf, piments, sauce samouraï",
                description_en: "Beef, chili, samurai sauce",
                image_url: "",
                tags: "Spicy"
            },
            {
                category: "Boissons",
                name: "Limonade Maison",
                name_en: "Home Lemonade",
                price: 1500,
                description: "Citron frais, menthe, sucre de canne",
                description_en: "Fresh lemon, mint, cane sugar",
                image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2000",
                tags: "Refreshing, Vegan"
            },
            {
                category: "Desserts",
                name: "Fondant Chocolat",
                name_en: "Chocolate Fondant",
                price: 3500,
                description: "Cœur coulant, glace vanille",
                description_en: "Melting heart, vanilla ice cream",
                image_url: "",
                tags: "Dessert"
            }
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
        if (!confirm('Are you sure you want to delete this filter?') || !restaurantId) return

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
            <p className="font-medium animate-pulse">Loading your premium menu...</p>
        </div>
    )

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 tracking-tight">Menu Management</h2>
                    <p className="text-zinc-500 mt-1 text-sm md:text-base flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                        Curate your restaurant's digital offering
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <a
                        href={restaurantId ? `/menu/${restaurantId}` : '#'}
                        target="_blank"
                        className="flex-1 sm:flex-none bg-emerald-50 text-[#064e3b] border border-emerald-100 px-4 py-3 rounded-xl hover:bg-emerald-100 flex items-center justify-center transition-all font-bold text-xs"
                    >
                        <Eye className="w-4 h-4 mr-2" /> Preview Menu
                    </a>
                    <button
                        onClick={downloadTemplate}
                        className="flex-1 sm:flex-none bg-white text-[#c5a059] border border-[#c5a059]/20 px-4 py-3 rounded-xl hover:bg-amber-50 flex items-center justify-center shadow-sm transition-all font-bold text-xs"
                    >
                        <Download className="w-4 h-4 mr-2" /> Blueprint
                    </button>
                    <button
                        onClick={() => document.getElementById('global-csv-import')?.click()}
                        className="flex-1 sm:flex-none bg-white text-zinc-600 border border-black/5 px-4 py-3 rounded-xl hover:bg-zinc-50 flex items-center justify-center shadow-sm transition-all font-bold text-xs"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Global Import
                    </button>
                    <input
                        type="file"
                        id="global-csv-import"
                        accept=".csv"
                        onChange={handleFileImport}
                        className="hidden"
                    />
                    <button
                        onClick={() => openModal('category')}
                        className="w-full sm:w-auto bg-[#064e3b] text-white px-6 py-3 rounded-xl hover:bg-[#053e2f] flex items-center justify-center shadow-xl shadow-emerald-900/10 transition-all font-bold text-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Category
                    </button>
                </div>
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
                        <h4 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Your menu is empty</h4>
                        <p className="text-zinc-500 max-w-xs mx-auto mb-8 font-medium">Start by creating categories like 'Starters', 'Main Courses', or 'Wine List'.</p>
                        <button onClick={() => openModal('category')} className="bg-[#064e3b] text-white px-8 py-4 rounded-2xl hover:bg-[#053e2f] transition-all font-bold shadow-xl shadow-emerald-900/10">
                            Create First Category
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-10 rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">
                                    {editingItem ? 'Edit' : 'Add New'} <span className="text-[#064e3b] italic">{modalType === 'category' ? 'Category' : 'Dish'}</span>
                                </h3>
                                <div className="w-16 h-1.5 bg-[#c5a059] rounded-full mt-3"></div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {modalType === 'dish' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-black/5 shadow-sm gap-2">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center">Visible</span>
                                        <button
                                            type="button"
                                            onClick={() => setNewDishAvailable(!newDishAvailable)}
                                            className={`w-10 h-5 rounded-full transition-all duration-300 relative ${newDishAvailable ? 'bg-[#064e3b]' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${newDishAvailable ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-black/5 shadow-sm gap-2">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center">In Stock</span>
                                        <button
                                            type="button"
                                            onClick={() => setNewDishSoldOut(!newDishSoldOut)}
                                            className={`w-10 h-5 rounded-full transition-all duration-300 relative ${newDishSoldOut ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${newDishSoldOut ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-[#c5a059]/30 shadow-sm gap-2">
                                        <div className="flex items-center gap-1">
                                            <Sparkles className="w-2 h-2 text-[#c5a059]" />
                                            <span className="text-[8px] font-black text-[#c5a059] uppercase tracking-widest">Specialty</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewDishSpecialty(!newDishSpecialty)}
                                            className={`w-10 h-5 rounded-full transition-all duration-300 relative ${newDishSpecialty ? 'bg-[#c5a059]' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${newDishSpecialty ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nom (FR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                        placeholder="Ex: Cocktails"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Name (EN)</label>
                                    <input
                                        type="text"
                                        value={newItemNameEn}
                                        onChange={(e) => setNewItemNameEn(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                        placeholder="Ex: Cocktails"
                                    />
                                </div>
                            </div>

                            {modalType === 'dish' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Hero Image</label>
                                        <div
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            className="relative aspect-video rounded-3xl border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-[#064e3b] group shadow-sm"
                                        >
                                            {newDishImage ? (
                                                <>
                                                    <Image src={newDishImage} alt="Preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Camera className="text-white w-10 h-10" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center space-y-2">
                                                    <ImageIcon className="text-zinc-200 w-12 h-12 mx-auto" />
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Upload Dish Visual</p>
                                                </div>
                                            )}
                                        </div>
                                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Price ({currency})</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                value={newDishPrice}
                                                onChange={(e) => setNewDishPrice(e.target.value)}
                                                className="block w-full rounded-2xl border border-black/5 bg-white pl-5 pr-12 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">₣</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description (FR)</label>
                                            <textarea
                                                value={newDishDesc}
                                                onChange={(e) => setNewDishDesc(e.target.value)}
                                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-medium min-h-[80px] shadow-sm text-sm"
                                                placeholder="Description en français..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description (EN)</label>
                                            <textarea
                                                value={newDishDescEn}
                                                onChange={(e) => setNewDishDescEn(e.target.value)}
                                                className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-medium min-h-[80px] shadow-sm text-sm"
                                                placeholder="Description in English..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Dietary & Style Tags</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Standard Tags */}
                                            {DIETARY_TAGS.map(tag => (
                                                <button
                                                    key={tag.name}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.name)}
                                                    className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-3 font-bold text-[11px] ${newDishTags.includes(tag.name)
                                                        ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-lg shadow-emerald-900/20'
                                                        : 'bg-white text-zinc-500 border-black/5 hover:border-emerald-200'
                                                        }`}
                                                >
                                                    <tag.icon className={`w-4 h-4 ${newDishTags.includes(tag.name) ? 'text-[#c5a059]' : 'text-[#c5a059]'}`} />
                                                    {lang === 'en' ? (tag.name_en || tag.name) : tag.name}
                                                </button>
                                            ))}

                                            {/* Custom Category Filters */}
                                            {categories.find(c => c.id === selectedCategoryId)?.badges?.map(badge => {
                                                const Icon = (BADGE_ICONS as any)[badge.icon] || Tag
                                                const isSelected = newDishTags.includes(badge.name)
                                                return (
                                                    <button
                                                        key={badge.id}
                                                        type="button"
                                                        onClick={() => toggleTag(badge.name)}
                                                        className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-3 font-bold text-[11px] ${isSelected
                                                            ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-lg shadow-emerald-900/20'
                                                            : 'bg-white text-zinc-500 border-black/5 hover:border-[#c5a059]/30'
                                                            }`}
                                                    >
                                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#c5a059]' : 'text-zinc-400'}`} />
                                                        {lang === 'en' ? (badge.name_en || badge.name) : badge.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 text-zinc-400 hover:text-zinc-600 font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] px-6 py-4 bg-[#064e3b] text-white rounded-2xl hover:bg-[#053e2f] shadow-xl shadow-emerald-900/10 font-bold text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? 'Update Item' : 'Create Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BADGE MODAL (Emerald version) */}
            {isBadgeModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-10 rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">Category <span className="text-[#064e3b] italic">Filters</span></h3>
                                <div className="w-16 h-1.5 bg-[#c5a059] rounded-full mt-3"></div>
                            </div>
                            <button onClick={() => setIsBadgeModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        {/* Existing Badges List */}
                        <div className="mb-10 space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Active Filters</label>
                            <div className="flex flex-wrap gap-3">
                                {categories.find(c => c.id === selectedCategoryId)?.badges?.map(badge => {
                                    const Icon = (BADGE_ICONS as any)[badge.icon] || Tag
                                    return (
                                        <div key={badge.id} className="relative group">
                                            <div className={`pl-4 pr-12 py-2.5 rounded-xl border flex items-center gap-3 ${badge.bg_color} ${badge.color} ${badge.border_color} shadow-sm`}>
                                                <Icon className="w-4 h-4" />
                                                <span className="font-bold text-sm">{lang === 'en' ? (badge.name_en || badge.name) : badge.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteBadge(badge.id)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md active:scale-90"
                                                title="Delete Filter"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )
                                })}
                                {(!categories.find(c => c.id === selectedCategoryId)?.badges || categories.find(c => c.id === selectedCategoryId)?.badges?.length === 0) && (
                                    <div className="py-4 px-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs font-medium w-full text-center">
                                        No custom filters yet for this category.
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleBadgeSubmit} className="space-y-6 pt-8 border-t border-black/5">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] ml-1">Create New Filter</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nom (FR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBadgeName}
                                        onChange={(e) => setNewBadgeName(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm text-sm"
                                        placeholder="Ex: Bio"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Name (EN)</label>
                                    <input
                                        type="text"
                                        value={newBadgeNameEn}
                                        onChange={(e) => setNewBadgeNameEn(e.target.value)}
                                        className="block w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-100 focus:border-[#064e3b] outline-none transition-all font-bold shadow-sm text-sm"
                                        placeholder="Ex: Organic"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-black/5">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Icon Selection</label>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                                    {Object.keys(BADGE_ICONS).map(iconName => {
                                        const Icon = (BADGE_ICONS as any)[iconName]
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setNewBadgeIcon(iconName)}
                                                className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${newBadgeIcon === iconName ? 'bg-[#064e3b] border-[#064e3b] shadow-lg text-white scale-110' : 'bg-white border-black/5 hover:border-[#c5a059]/30 text-zinc-400 hover:text-[#064e3b]'}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-black/5">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Badge Style (Color)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Emerald Green', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                        { label: 'Premium Gold', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
                                        { label: 'Royal Blue', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                                        { label: 'Sunset Red', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
                                        { label: 'Elegant Purple', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
                                        { label: 'Sleek Zinc', color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-200' },
                                    ].map(style => (
                                        <button
                                            key={style.label}
                                            type="button"
                                            onClick={() => {
                                                setNewBadgeColor(style.color)
                                                setNewBadgeBg(style.bg)
                                                setNewBadgeBorder(style.border)
                                            }}
                                            className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${newBadgeColor === style.color ? 'border-[#064e3b] bg-emerald-50/20' : 'border-black/5 bg-zinc-50/50'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full ${style.bg} border ${style.border} shadow-sm`} />
                                            <span className={`text-[10px] font-bold ${style.color}`}>{style.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-[#064e3b] text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:bg-[#053e2f] transition-all mt-4">
                                Add Filter
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORT PREVIEW MODAL */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
                    <div className="bg-[#fdfcfb] p-10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">Confirm <span className="text-[#064e3b] italic">Bulk Import</span></h3>
                                <p className="text-zinc-500 text-sm mt-2">Preview the {importData.length} items from your file.</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors">
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-black/5 mb-8">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50 border-b border-black/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Name (FR/EN)</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Image URL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 bg-white">
                                    {importData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4">
                                                <span className="bg-emerald-50 text-[#064e3b] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                    {row.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-zinc-900 text-sm">{row.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-medium italic">{row.name_en}</p>
                                            </td>
                                            <td className="px-6 py-4 font-black text-sm text-[#064e3b] whitespace-nowrap">{row.price.toLocaleString()} {currency}</td>
                                            <td className="px-6 py-4 text-xs text-zinc-500 max-w-xs truncate">{row.description}</td>
                                            <td className="px-6 py-4">
                                                {row.image_url ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/5">
                                                        <img src={row.image_url} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : <span className="text-zinc-300 italic text-[10px]">None</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-black/5">
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 text-[#c5a059] font-bold text-xs hover:underline"
                            >
                                <Download className="w-4 h-4" /> Download template CSV
                            </button>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="flex-1 md:flex-none px-8 py-4 text-zinc-400 hover:text-zinc-600 font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBulkImport}
                                    disabled={loading}
                                    className="flex-[2] md:flex-none px-10 py-4 bg-[#064e3b] text-white rounded-2xl hover:bg-[#053e2f] shadow-xl shadow-emerald-900/10 font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                                    Confirm Import
                                </button>
                            </div>
                        </div>
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-black/5 pb-6">
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-2 -ml-2 text-zinc-300 hover:text-[#c5a059] cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#064e3b]">{t(category, 'name')}</h3>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        {category.dishes?.length || 0} Items
                    </span>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('category', null, category)} className="p-2 text-zinc-400 hover:text-[#064e3b] transition-colors rounded-xl">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-xl">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => openBadgeModal(category.id)}
                        className="flex-1 lg:flex-none text-zinc-600 text-xs font-bold hover:text-[#064e3b] flex items-center justify-center bg-white px-4 py-2.5 rounded-xl transition shadow-sm border border-black/5"
                    >
                        <Tag className="w-3.5 h-3.5 mr-2 text-[#c5a059]" /> Filters
                    </button>
                    <button
                        onClick={() => openModal('dish', category.id)}
                        className="flex-1 lg:flex-none text-[#064e3b] text-xs font-bold hover:text-white hover:bg-[#064e3b] flex items-center justify-center bg-emerald-50 px-4 py-2.5 rounded-xl transition shadow-sm border border-emerald-100"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Dish
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {category.dishes?.map((dish: Dish) => (
                    <div key={dish.id} className={`group relative bg-white rounded-[2rem] md:rounded-[2.5rem] border border-black/5 transition-all duration-500 overflow-hidden flex flex-col ${dish.is_available === false ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-[#c5a059]/20 hover:-translate-y-1'}`}>
                        <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-x-2 md:group-hover:translate-x-0 flex flex-col gap-2">
                            <a
                                href={`/menu/${restaurantId}`}
                                target="_blank"
                                className="text-[#c5a059] hover:text-white hover:bg-[#c5a059] bg-white/90 backdrop-blur-md p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl border border-black/5 transition-all hover:scale-110 flex items-center justify-center"
                                title="View on digital menu"
                            >
                                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </a>
                            <button onClick={() => openModal('dish', category.id, dish)} className="text-zinc-600 hover:text-[#064e3b] bg-white/90 backdrop-blur-md p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl border border-black/5 transition-all hover:scale-110">
                                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button onClick={() => handleDeleteDish(dish.id)} className="text-red-500 hover:text-red-600 bg-white/90 backdrop-blur-md p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl border border-black/5 transition-all hover:scale-110">
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        </div>

                        <div className="aspect-[4/3] bg-zinc-50 overflow-hidden relative">
                            {dish.image_url ? (
                                <Image src={dish.image_url} alt={dish.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-200">
                                    <ImageIcon className="w-16 h-16" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {dish.is_available === false && <span className="bg-zinc-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10">Hidden</span>}
                                {dish.is_sold_out && <span className="bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10">Out of Stock</span>}
                            </div>
                        </div>

                        <div className="p-5 md:p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                <h4 className="font-serif font-bold text-lg md:text-xl text-zinc-900 leading-tight group-hover:text-[#064e3b] transition-colors">{t(dish, 'name')}</h4>
                                <span className="text-[#064e3b] font-bold text-base md:text-lg whitespace-nowrap ml-4">{dish.price.toLocaleString()} {currency}</span>
                            </div>
                            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed line-clamp-2 mb-4 md:mb-6 flex-1 font-medium">{t(dish, 'description')}</p>
                        </div>
                    </div>
                ))}
                {(!category.dishes || category.dishes.length === 0) && (
                    <div className="col-span-full py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                            <Search className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 font-medium">No dishes in this category yet.</p>
                        <button onClick={() => openModal('dish', category.id)} className="text-[#064e3b] font-bold mt-4 hover:underline flex items-center justify-center mx-auto gap-2">
                            <Plus className="w-4 h-4" /> Add your first dish
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
