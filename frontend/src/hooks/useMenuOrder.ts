'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { translate } from '@/lib/translate'

export interface MenuOrderState {
    selection: Record<string, number>
    itemNotes: Record<string, string>
    setItemNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>
    customerName: string
    setCustomerName: (name: string) => void
    customerPhone: string
    setCustomerPhone: (phone: string) => void
    isSelectionModalOpen: boolean
    setIsSelectionModalOpen: (open: boolean) => void
    orderType: 'dine_in' | 'takeaway' | 'delivery'
    setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void
    deliveryAddress: string
    setDeliveryAddress: (address: string) => void
    updateQuantity: (dishId: string, delta: number) => void
    removeFromSelection: (dishId: string) => void
    totalItems: number
    totalPrice: number
    sendWhatsAppOrder: () => Promise<void>
    formatPrice: (price: number) => string
    isOrderingEnabled: boolean
}

interface UseMenuOrderOptions {
    restaurantId: string | undefined
    restaurant: any
    categories: Category[]
    tableNumber: string | null
    lang: 'fr' | 'en'
}

export function useMenuOrder({ restaurantId, restaurant, categories, tableNumber, lang }: UseMenuOrderOptions): MenuOrderState {
    const [selection, setSelection] = useState<Record<string, number>>({})
    const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
    const [deliveryAddress, setDeliveryAddress] = useState('')

    // Force dine_in if table number is present
    useEffect(() => {
        if (tableNumber) {
            setOrderType('dine_in')
        }
    }, [tableNumber])

    // Persist selection to localStorage
    useEffect(() => {
        if (restaurantId) {
            localStorage.setItem(`selection_${restaurantId}`, JSON.stringify(selection))
        }
    }, [selection, restaurantId])

    // Load selection from localStorage on mount
    useEffect(() => {
        if (restaurantId) {
            const saved = localStorage.getItem(`selection_${restaurantId}`)
            if (saved) setSelection(JSON.parse(saved))
        }
    }, [restaurantId])

    const updateQuantity = (dishId: string, delta: number) => {
        setSelection(prev => {
            const current = prev[dishId] || 0
            const next = current + delta
            if (next <= 0) {
                const { [dishId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [dishId]: next }
        })
    }

    const removeFromSelection = (dishId: string) => {
        setSelection(prev => {
            const { [dishId]: _, ...rest } = prev
            return rest
        })
    }

    const totalItems = Object.values(selection).reduce((a, b) => a + b, 0)
    const totalPrice = categories
        .flatMap(c => c.dishes || [])
        .filter(d => selection[d.id])
        .reduce((sum, d) => sum + (d.price * selection[d.id]), 0)

    const isOrderingEnabled = restaurant?.is_ordering_enabled !== false

    const formatPrice = (price: number) => {
        return `${price.toLocaleString()} ${restaurant?.currency || 'FCFA'}`
    }

    const t = (item: any, field: string) => translate(item, field, lang)

    const isCurrentlyOpen = () => {
        if (!restaurant?.opening_hours || restaurant.opening_hours.length === 0) return true
        const now = new Date()
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const currentDay = dayNames[now.getDay()]
        const dayConfig = restaurant.opening_hours.find((d: any) => d.day === currentDay)
        if (!dayConfig || !dayConfig.isOpen) return false
        try {
            const [start, end] = dayConfig.hours.split('-').map((s: string) => s.trim())
            const [startH, startM] = start.split(':').map(Number)
            const [endH, endM] = end.split(':').map(Number)
            const currentH = now.getHours()
            const currentM = now.getMinutes()
            const startTime = startH * 60 + startM
            const endTime = endH * 60 + endM
            const currentTime = currentH * 60 + currentM
            return currentTime >= startTime && currentTime <= endTime
        } catch (e) {
            return true
        }
    }

    const sendWhatsAppOrder = async () => {
        if (!restaurant?.whatsapp_number) return

        if (!isCurrentlyOpen()) {
            const { toast } = await import('sonner')
            toast.error(lang === 'fr'
                ? 'Le restaurant est actuellement fermé. Votre commande pourrait ne pas être traitée immédiatement.'
                : 'The restaurant is currently closed. Your order might not be processed immediately.')
        }

        const selectedItems: any[] = []
        let message = `*${lang === 'fr' ? 'Commande' : 'Order'} - ${restaurant.name}*\n`
        message += `Type: *${orderType === 'dine_in' ? 'Sur Place' : orderType === 'takeaway' ? 'Emporter' : 'Livraison'}*\n\n`

        categories.forEach(c => {
            const selectedInCat = c.dishes?.filter(d => selection[d.id]) || []
            if (selectedInCat.length > 0) {
                message += `*${t(c, 'name')} :*\n`
                selectedInCat.forEach(d => {
                    message += `- ${t(d, 'name')} (x${selection[d.id]}) : ${(d.price * selection[d.id]).toLocaleString()} ${restaurant.currency || 'FCFA'}\n`
                    if (itemNotes[d.id]) message += `  _Note: ${itemNotes[d.id]}_\n`
                    selectedItems.push({
                        name: t(d, 'name'),
                        price: d.price,
                        quantity: selection[d.id],
                        note: itemNotes[d.id]
                    })
                })
                message += `\n`
            }
        })

        if (orderType === 'dine_in' && tableNumber) {
            message += `📍 *Table : ${tableNumber}*\n`
        }
        if (orderType === 'delivery' && deliveryAddress) {
            message += `🏠 *Adresse : ${deliveryAddress}*\n`
        }
        if (customerName) {
            message += `👤 *Client : ${customerName}*\n`
        }
        message += `\n*Total : ${totalPrice.toLocaleString()} ${restaurant.currency || 'FCFA'}*`

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/whatsapp-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    items: selectedItems,
                    totalPrice,
                    customerName: customerName || undefined,
                    tableNumber: orderType === 'dine_in' ? tableNumber || undefined : undefined,
                    orderType,
                    deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined
                })
            })
        } catch (err) {
            console.error('Failed to log WhatsApp order:', err)
        }

        const encodedMessage = encodeURIComponent(message)
        const cleanNumber = restaurant.whatsapp_number.replace(/[^\d+]/g, '')
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`
        window.location.href = whatsappUrl
    }

    return {
        selection,
        itemNotes,
        setItemNotes,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        isSelectionModalOpen,
        setIsSelectionModalOpen,
        orderType,
        setOrderType,
        deliveryAddress,
        setDeliveryAddress,
        updateQuantity,
        removeFromSelection,
        totalItems,
        totalPrice,
        sendWhatsAppOrder,
        formatPrice,
        isOrderingEnabled,
    }
}
