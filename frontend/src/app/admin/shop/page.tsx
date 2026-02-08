'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ShoppingBag, Plus, Edit2, Trash2, PackageCheck, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface ShopItem {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    category: string
    stock: number
    is_available: boolean
    features: string[]
}

export default function ShopManagementPage() {
    const [items, setItems] = useState<ShopItem[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: 'HARDWARE',
        stock: 0,
        features: [] as string[]
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/admin/all`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        const data = await res.json()
        setItems(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const url = editingItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/shop/${editingItem.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/shop`

            const res = await fetch(url, {
                method: editingItem ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to save item')

            toast.success(editingItem ? 'Article mis à jour' : 'Article créé')
            setIsModalOpen(false)
            resetForm()
            fetchItems()
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cet article ?')) return

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            if (!res.ok) throw new Error('Failed to delete')

            toast.success('Article supprimé')
            fetchItems()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const toggleAvailability = async (id: string, isAvailable: boolean) => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/${id}/availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ isAvailable })
            })

            if (!res.ok) throw new Error('Failed to update')

            toast.success(isAvailable ? 'Article activé' : 'Article désactivé')
            fetchItems()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    const openEditModal = (item: ShopItem) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            category: item.category,
            stock: item.stock,
            features: item.features || []
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setEditingItem(null)
        setFormData({
            name: '',
            description: '',
            price: 0,
            image_url: '',
            category: 'HARDWARE',
            stock: 0,
            features: []
        })
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#064e3b] mb-2">Shop Management</h1>
                    <p className="text-zinc-500 font-bold">Gérer les articles de la boutique</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-[#c5a059] text-[#064e3b] px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                >
                    <Plus className="w-4 h-4" /> Nouvel Article
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] border border-zinc-100 p-6 shadow-sm hover:border-[#c5a059] transition-all">
                        {item.image_url && (
                            <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-black text-lg text-zinc-900">{item.name}</h3>
                                <p className="text-xs text-zinc-400 uppercase font-bold">{item.category}</p>
                            </div>
                            <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${item.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {item.is_available ? 'Disponible' : 'Indisponible'}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-600 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                            <span className="text-2xl font-black text-[#c5a059]">{item.price.toLocaleString()} FCFA</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAvailability(item.id, !item.is_available)}
                                    className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                >
                                    <PackageCheck className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#064e3b]">
                                {editingItem ? 'Modifier l\'article' : 'Nouvel Article'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                >
                                    <option value="HARDWARE">Hardware</option>
                                    <option value="POS">POS</option>
                                    <option value="PRINTER">Imprimante</option>
                                    <option value="OTHER">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">URL Image</label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#c5a059] focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl border border-zinc-200 text-zinc-700 font-black uppercase text-xs hover:bg-zinc-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 rounded-2xl bg-[#c5a059] text-[#064e3b] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl"
                                >
                                    {editingItem ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
