'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function useOrderTracking(staff: any) {
    const [orders, setOrders] = useState<any[]>([])
    const [whatsappOrders, setWhatsappOrders] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
    const [restaurantName, setRestaurantName] = useState('')
    const [currency, setCurrency] = useState('FCFA')
    const [paymentLogic, setPaymentLogic] = useState<'pay_before' | 'pay_after'>('pay_after')
    const [loading, setLoading] = useState(true)

    const notify = (msg: string) => {
        toast.info(msg, { icon: '🔔' })
        try { new Audio('/notification.mp3').play() } catch (e) { }
    }

    const fetchOrders = async (resId: string) => {
        const { data } = await supabase.from('orders').select('*').eq('restaurant_id', resId).neq('production_status', 'SERVED').neq('production_status', 'CANCELLED').order('created_at', { ascending: false })
        setOrders(data || [])
    }

    const fetchWhatsappOrders = async (resId: string) => {
        const { data } = await supabase.from('whatsapp_orders').select('*').eq('restaurant_id', resId).eq('status', 'PENDING').order('created_at', { ascending: false })
        setWhatsappOrders(data || [])
    }

    const fetchTransactions = async (staffId: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/transactions/${staffId}`, {
            headers: { 'x-staff-id': staffId }
        })
        if (res.ok) setTransactions(await res.json())
    }

    const fetchRestaurantData = async (resId: string) => {
        const { data: res } = await supabase.from('restaurants').select('*').eq('id', resId).single()
        if (res) { setRestaurantName(res.name); setCurrency(res.currency || 'FCFA'); setPaymentLogic(res.payment_logic || 'pay_after'); }
        const { data: cats } = await supabase.from('categories').select('*, dishes(*)').eq('restaurant_id', resId).order('order', { ascending: true })
        if (cats) { setCategories(cats); }
        return cats
    }

    const updateOrderStatus = async (id: string, status: string, isPaid?: boolean) => {
        if (!staff) return
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/pos-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-staff-id': staff.id
            },
            body: JSON.stringify({ status, isPaid, staffId: staff.id })
        })
    }

    const updateWhatsAppStatus = async (id: string, status: 'VALIDATED' | 'CANCELLED', deliveryData?: any) => {
        if (!staff) return
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/whatsapp-orders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-staff-id': staff.id
            },
            body: JSON.stringify({
                status,
                staffId: staff.id,
                customerName: deliveryData?.customerName,
                deliveryAddress: deliveryData?.deliveryAddress
            })
        })
        setWhatsappOrders(prev => prev.filter(o => o.id !== id))
    }

    const updateWhatsAppPayment = async (id: string, isPaid: boolean) => {
        if (!staff) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/whatsapp-orders/${id}/payment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-staff-id': staff.id
                },
                body: JSON.stringify({ isPaid, staffId: staff.id })
            })
            if (!res.ok) throw new Error('Echec mise a jour paiement')
            setWhatsappOrders(prev => prev.map(o => o.id === id ? { ...o, is_paid: isPaid, payment_status: isPaid ? 'PAID' : 'UNPAID' } : o))
            toast.success(isPaid ? 'Marque comme paye' : 'Marque comme non paye')
        } catch (error) {
            toast.error('Erreur lors de la mise a jour')
        }
    }

    const toggleDishAvailability = async (dishId: string, currentStatus: boolean) => {
        if (!staff) return
        const nextStatus = !currentStatus
        setCategories(prev => prev.map(cat => ({
            ...cat,
            dishes: cat.dishes?.map((d: any) => d.id === dishId ? { ...d, is_available: nextStatus } : d)
        })))

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/dish/${dishId}/availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-staff-id': staff.id
                },
                body: JSON.stringify({ isAvailable: nextStatus, staffId: staff.id })
            })
            if (!res.ok) throw new Error('Failed to update')
            toast.success(nextStatus ? 'Plat active' : 'Plat marque comme epuise')
        } catch (error) {
            toast.error('Erreur lors de la mise a jour')
            setCategories(prev => prev.map(cat => ({
                ...cat,
                dishes: cat.dishes?.map((d: any) => d.id === dishId ? { ...d, is_available: currentStatus } : d)
            })))
        }
    }

    const submitManualOrder = async (cart: Record<string, number>, itemNotes: Record<string, string>, manualType: string, manualTable: string, manualName: string, manualAddress: string) => {
        if (!staff) return
        const items = categories.flatMap(c => c.dishes).filter(d => cart[d.id]).map(d => ({ id: d.id, name: d.name, price: d.price, quantity: cart[d.id], note: itemNotes[d.id] || '' }))
        if (items.length === 0) return
        const totalPrice = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${staff.restaurant_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-staff-id': staff.id
            },
            body: JSON.stringify({ items, totalPrice, orderType: manualType, tableNumber: manualType === 'dine_in' ? manualTable : undefined, customerName: manualName || 'Comptoir', deliveryAddress: manualType === 'delivery' ? manualAddress : undefined, processedBy: staff.id, isPaid: paymentLogic === 'pay_before' })
        })
        toast.success('Envoye !')
    }

    useEffect(() => {
        if (!staff) return

        const loadAllData = async () => {
            try {
                await fetchRestaurantData(staff.restaurant_id)
                await fetchOrders(staff.restaurant_id)
                await fetchWhatsappOrders(staff.restaurant_id)
                await fetchTransactions(staff.id)
            } catch (err) {
                console.error('Erreur lors du chargement initial:', err)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()

        const pollInterval = setInterval(() => {
            fetchOrders(staff.restaurant_id)
            fetchWhatsappOrders(staff.restaurant_id)
        }, 120000)

        const channel = supabase
            .channel(`pos-simplified-sync-${staff.restaurant_id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${staff.restaurant_id}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new, ...prev])
                    notify('Nouvelle commande !')
                } else {
                    setOrders(prev => {
                        const newOrder = payload.new as any
                        if (newOrder.production_status === 'SERVED' || newOrder.production_status === 'CANCELLED') {
                            if (newOrder.processed_by === staff.id) {
                                setTransactions(tPrev => {
                                    const exists = tPrev.find(t => t.id === newOrder.id)
                                    if (exists) return tPrev.map(t => t.id === newOrder.id ? newOrder : t)
                                    return [newOrder, ...tPrev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                })
                            }
                            return prev.filter(o => o.id !== newOrder.id)
                        }
                        return prev.map(o => o.id === newOrder.id ? newOrder : o)
                    })
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_orders', filter: `restaurant_id=eq.${staff.restaurant_id}` }, (payload) => {
                setWhatsappOrders(prev => [payload.new, ...prev])
                notify('Flash WhatsApp !')
            })

        channel.subscribe((status) => {
            console.log('Realtime status:', status)
            if (status === 'SUBSCRIBED') setConnectionStatus('connected')
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                setConnectionStatus('disconnected')
                toast.error('Connexion perdue. Tentative de reconnexion...')
            }
        })

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [staff])

    return {
        orders,
        whatsappOrders,
        transactions,
        categories,
        connectionStatus,
        restaurantName,
        currency,
        paymentLogic,
        loading,
        setLoading,
        updateOrderStatus,
        updateWhatsAppStatus,
        updateWhatsAppPayment,
        toggleDishAvailability,
        submitManualOrder,
        fetchOrders,
        fetchWhatsappOrders,
    }
}
