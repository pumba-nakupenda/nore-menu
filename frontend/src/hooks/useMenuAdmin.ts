'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { Category } from '@/types'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { arrayMove } from '@dnd-kit/sortable'
import { DragEndEvent } from '@dnd-kit/core'
import { fetchMenuData } from '@/hooks/useFetchMenu'

export function useMenuAdmin() {
    const { restaurantId, restaurant, token } = useAuth()
    const currency = restaurant?.currency || 'FCFA'
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'category' | 'dish'>('category')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [importData, setImportData] = useState<any[]>([])
    const [lang, setLang] = useState<'fr' | 'en'>('fr')

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
        if (restaurantId) loadMenu(restaurantId)
    }, [restaurantId])

    const loadMenu = async (id: string) => {
        setLoading(true)
        try {
            const data = await fetchMenuData(id)
            setCategories(data.categories || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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

        const oldIndex = categories.findIndex(c => c.id === active.id)
        const newIndex = categories.findIndex(c => c.id === over.id)

        const newOrder = arrayMove(categories, oldIndex, newIndex)
        setCategories(newOrder)

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

            const { error: uploadError } = await supabase.storage
                .from('dish-images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('dish-images')
                .getPublicUrl(fileName)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            return null
        } finally {
            setUploading(false)
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId) return

        try {
            setUploading(true)

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

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/dish/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (restaurantId) loadMenu(restaurantId)
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Supprimer une catégorie supprimera tous ses plats. Continuer ?")) return

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

    const handleBadgeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!restaurantId || !selectedCategoryId) return
        setLoading(true)

        try {
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

    const handleDeleteBadge = async (badgeId: string) => {
        if (!confirm('Voulez-vous supprimer ce filtre ?') || !restaurantId) return

        try {
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

    const downloadTemplate = () => {
        const data = [
            { category: "Burgers", name: "Le Classique", price: 4500, description: "Bœuf, cheddar, salade", image_url: "", tags: "Popular" }
        ]
        const csv = Papa.unparse(data)
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = "nore_menu_blueprint.csv"
        link.click()
    }

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

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
                }))
                setImportData(formatted)
                setIsImportModalOpen(true)
            }
        })
    }

    const confirmBulkImport = async () => {
        if (!restaurantId || importData.length === 0) return
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/import-global`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ restaurantId, items: importData })
            })

            if (!res.ok) throw new Error('Global import failed')

            const result = await res.json()
            setIsImportModalOpen(false)
            setImportData([])
            loadMenu(restaurantId)
            toast.success(`Importation réussie : ${result.importedCount} plats ajoutés.`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        // Auth & config
        restaurantId,
        currency,
        lang,

        // Data
        categories,
        loading,

        // DnD
        handleDragEnd,

        // Translation helper
        t,

        // Modal state
        isModalOpen,
        modalType,
        editingItem,
        openModal,
        closeModal: () => setIsModalOpen(false),

        // Dish form state
        newItemName, setNewItemName,
        newItemNameEn, setNewItemNameEn,
        newDishPrice, setNewDishPrice,
        newDishDesc, setNewDishDesc,
        newDishDescEn, setNewDishDescEn,
        newDishTags,
        toggleTag,
        newDishAvailable, setNewDishAvailable,
        newDishSoldOut, setNewDishSoldOut,
        newDishSpecialty, setNewDishSpecialty,
        newDishImage,
        handleImageChange,
        uploading,
        handleSubmit,

        // Category actions
        handleDeleteCategory,
        handleDeleteDish,

        // Badge
        isBadgeModalOpen,
        selectedCategoryId,
        newBadgeName, setNewBadgeName,
        newBadgeNameEn, setNewBadgeNameEn,
        newBadgeIcon, setNewBadgeIcon,
        openBadgeModal,
        closeBadgeModal: () => setIsBadgeModalOpen(false),
        handleBadgeSubmit,
        handleDeleteBadge,

        // Import
        isImportModalOpen,
        importData,
        closeImportModal: () => setIsImportModalOpen(false),
        downloadTemplate,
        handleFileImport,
        confirmBulkImport,
    }
}
