'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Clock, CheckCircle2, Utensils, PackageCheck, Package, XCircle, Search, Loader2, Bell, MapPin, ChevronRight, LogOut, ShoppingBag, UtensilsCrossed, Monitor, Coins, CreditCard, Plus, Minus, X, Trash2, ArrowLeft, Send, Sparkles, LayoutGrid, MessageCircle, User, Phone, ChefHat, History, Filter, Receipt, Bike, Layers, Printer, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const COLUMNS_KITCHEN = [
    { id: 'RECEIVED', title: 'À préparer', color: 'amber', bgColor: 'bg-amber-50', accentColor: 'bg-amber-500', borderColor: 'border-amber-100', textColor: 'text-amber-900' },
    { id: 'COOKING', title: 'En cuisine', color: 'blue', bgColor: 'bg-blue-50', accentColor: 'bg-blue-500', borderColor: 'border-blue-100', textColor: 'text-blue-900' },
]

export default function POSDashboardPage() {
    const [staff, setStaff] = useState<any>(null)
    const [restaurantName, setRestaurantName] = useState('')
    const [currency, setCurrency] = useState('FCFA')
    const [paymentLogic, setPaymentLogic] = useState<'pay_before' | 'pay_after'>('pay_after')
    const [loading, setLoading] = useState(true)
    const [currentTab, setCurrentTab] = useState<string>('')

    const [orders, setOrders] = useState<any[]>([])
    const [whatsappOrders, setWhatsappOrders] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [cart, setCart] = useState<Record<string, number>>({})
    const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
    const [manualTable, setManualTable] = useState('')
    const [manualName, setManualName] = useState('')
    const [manualAddress, setManualAddress] = useState('')
    const [manualType, setManualType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
    const [searchQuery, setSearchQuery] = useState('')
    const [stockSearch, setStockSearch] = useState('')
    const [transFilter, setTransFilter] = useState('ALL')
    const [printingOrder, setPrintingOrder] = useState<any>(null)
    const printRef = useRef<HTMLDivElement>(null)

    // DELIVERY FLOW STATES
    const [confirmingOrder, setConfirmingOrder] = useState<any>(null)
    const [customerName, setCustomerName] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [isCartOpen, setIsCartOpen] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const sessionStr = localStorage.getItem('nore_pos_session')
        console.log('POS Session check:', sessionStr ? 'Trouvée' : 'Non trouvée')
        
        if (!sessionStr) { 
            console.log('Aucune session POS, redirection vers login...')
            router.push('/pos/login')
            return 
        }

        let staffData: any
        try {
            staffData = JSON.parse(sessionStr)
            if (!staffData || !staffData.id || !staffData.restaurant_id) {
                throw new Error('Données de session incomplètes')
            }
            setStaff(staffData)
        } catch (e) {
            console.error('Session POS invalide:', e)
            localStorage.removeItem('nore_pos_session')
            router.push('/pos/login')
            return
        }

        // Set initial tab based on perms
        if (staffData.can_view_cashier) setCurrentTab('cashier')
        else if (staffData.can_view_whatsapp) setCurrentTab('whatsapp')
        else if (staffData.can_view_kitchen) setCurrentTab('kitchen')
        else setCurrentTab('transactions')

        const loadAllData = async () => {
            try {
                await fetchRestaurantData(staffData.restaurant_id)
                await fetchOrders(staffData.restaurant_id)
                await fetchWhatsappOrders(staffData.restaurant_id)
                await fetchTransactions(staffData.id)
            } catch (err) {
                console.error('Erreur lors du chargement initial:', err)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()

        // Background refresh fallback (every 2 minutes)
        const pollInterval = setInterval(() => {
            fetchOrders(staffData.restaurant_id)
            fetchWhatsappOrders(staffData.restaurant_id)
        }, 120000)

        const channel = supabase
            .channel(`pos-simplified-sync-${staffData.restaurant_id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${staffData.restaurant_id}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new, ...prev])
                    notify('Nouvelle commande !')
                } else {
                    setOrders(prev => {
                        const newOrder = payload.new as any
                        if (newOrder.production_status === 'SERVED' || newOrder.production_status === 'CANCELLED') {
                            if (newOrder.processed_by === staffData.id) {
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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_orders', filter: `restaurant_id=eq.${staffData.restaurant_id}` }, (payload) => {
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
    }, [])

    const notify = (msg: string) => {
        toast.info(msg, { icon: <Bell className="w-4 h-4" /> })
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
        if (cats) { setCategories(cats); if (cats.length > 0) setActiveCategory(cats[0].id); }
    }

    const updateOrderStatus = async (id: string, status: string, isPaid?: boolean) => {
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

    const handleConfirmWhatsApp = async () => {
        if (!confirmingOrder) return
        
        setLoading(true)
        try {
            await updateWhatsAppStatus(confirmingOrder.id, 'VALIDATED', {
                customerName: customerName || 'Client WhatsApp',
                deliveryAddress: deliveryAddress
            })
            toast.success('Commande validée et envoyée en cuisine !')
            setConfirmingOrder(null)
            setCustomerName('')
            setDeliveryAddress('')
        } catch (error) {
            toast.error('Erreur lors de la validation')
        } finally {
            setLoading(false)
        }
    }

    const updateWhatsAppPayment = async (id: string, isPaid: boolean) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/whatsapp-orders/${id}/payment`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-staff-id': staff.id
                },
                body: JSON.stringify({ isPaid, staffId: staff.id })
            })
            if (!res.ok) throw new Error('Échec mise à jour paiement')

            // Optimistic update
            setWhatsappOrders(prev => prev.map(o => o.id === id ? { ...o, is_paid: isPaid, payment_status: isPaid ? 'PAID' : 'UNPAID' } : o))
            toast.success(isPaid ? 'Marqué comme payé' : 'Marqué comme non payé')
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    const toggleDishAvailability = async (dishId: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus
        // Optimistic update
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
            toast.success(nextStatus ? 'Plat activé' : 'Plat marqué comme épuisé')
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
            // Rollback
            setCategories(prev => prev.map(cat => ({
                ...cat,
                dishes: cat.dishes?.map((d: any) => d.id === dishId ? { ...d, is_available: currentStatus } : d)
            })))
        }
    }

    const updateCart = (dishId: string, delta: number) => {
        setCart(prev => {
            const current = prev[dishId] || 0
            const next = current + delta
            if (next <= 0) { const { [dishId]: _, ...rest } = prev; return rest; }
            return { ...prev, [dishId]: next }
        })
    }

    const submitManualOrder = async () => {
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
        setCart({}); setManualTable(''); setManualName(''); setManualAddress('');
        toast.success('Envoyé !')
    }

    const handleLogout = () => { 
        localStorage.removeItem('nore_pos_session'); 
        router.push('/pos/login'); 
    }

    const handlePrint = (order: any) => {
        setPrintingOrder(order)
        setTimeout(() => {
            window.print()
            setPrintingOrder(null)
        }, 100)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]"><div className="flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" /><p className="text-xs font-black uppercase tracking-widest text-zinc-400">Chargement du Terminal...</p></div></div>

    const cartTotal = categories.flatMap(c => c.dishes || []).filter(d => cart[d.id]).reduce((sum, d) => sum + (d.price * cart[d.id]), 0)
    const typeIcon = (type: string) => {
        if (type === 'dine_in') return <UtensilsCrossed className="w-3 h-3" />
        if (type === 'takeaway') return <ShoppingBag className="w-3 h-3" />
        return <Bike className="w-3 h-3" />
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans overflow-hidden">
            <header className="bg-[#053e2f] text-white p-3 lg:p-4 flex justify-between items-center shadow-xl shrink-0">
                <div className="flex items-center gap-2 lg:gap-6">
                    <div className="flex items-center gap-2 lg:gap-4 border-r border-white/10 pr-3 lg:pr-6 mr-1 lg:mr-2"><div className="bg-[#c5a059] p-1.5 lg:p-2 rounded-lg lg:rounded-xl text-[#064e3b] shadow-lg"><ChefHat className="w-4 h-4 lg:w-5 lg:h-5" /></div><h1 className="font-black tracking-tighter text-sm lg:text-lg truncate max-w-[80px] lg:max-w-none">{restaurantName}</h1></div>
                    <nav className="flex bg-white/5 p-1 rounded-xl lg:rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                        {staff?.can_view_whatsapp && <button onClick={() => setCurrentTab('whatsapp')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'whatsapp' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><MessageCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">WhatsApp</span> {whatsappOrders.length > 0 && <span className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[7px]">{whatsappOrders.length}</span>}</button>}
                        {staff?.can_view_cashier && <button onClick={() => setCurrentTab('cashier')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'cashier' ? 'bg-[#c5a059] text-[#064e3b]' : 'text-white/40 hover:text-white'}`}><Coins className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Caisse</span></button>}
                        {staff?.can_view_kitchen && <button onClick={() => setCurrentTab('kitchen')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'kitchen' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><Utensils className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Cuisine</span> {orders.length > 0 && <span className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[7px]">{orders.length}</span>}</button>}
                        {staff?.can_manage_stocks && <button onClick={() => setCurrentTab('stocks')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'stocks' ? 'bg-amber-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Stocks</span></button>}
                        {staff?.can_view_transactions && <button onClick={() => setCurrentTab('transactions')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'transactions' ? 'bg-zinc-100 text-zinc-900 shadow-lg' : 'text-white/40 hover:text-white'}`}><History className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Ventes</span></button>}
                    </nav>
                </div>
                <div className="flex items-center gap-2 lg:gap-4">
                    <div className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border hidden sm:flex items-center gap-1.5 lg:gap-2 ${paymentLogic === 'pay_before' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full animate-pulse ${paymentLogic === 'pay_before' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{paymentLogic === 'pay_before' ? 'Pré-payé' : 'Post-payé'}</span>
                    </div>
                    <div className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border flex items-center gap-1.5 lg:gap-2 ${connectionStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : connectionStatus === 'connecting' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-bounce'}`} />
                        <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{connectionStatus === 'connected' ? 'Live' : 'Synchro'}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 lg:p-3 bg-white/5 hover:bg-red-500/20 text-white rounded-xl lg:rounded-2xl transition-all"><LogOut className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" /></button>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden">
                {/* WHATSAPP */}
                {currentTab === 'whatsapp' && (
                    <div className="absolute inset-0 p-4 lg:p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {whatsappOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-zinc-100 p-5 lg:p-8 shadow-sm flex flex-col hover:border-emerald-200 transition-all">
                                    <div className="flex justify-between items-start mb-4 lg:mb-6">
                                        <div><span className="font-black text-zinc-900 block text-base lg:text-lg">#{order.id.slice(0, 6)}</span><p className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[100px]">{order.customer_name || 'WhatsApp'}</p></div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="bg-emerald-50 text-emerald-700 text-[7px] lg:text-[8px] font-black px-1.5 lg:px-2 py-0.5 lg:py-1 rounded border border-emerald-100 uppercase tracking-widest flex items-center gap-1">{typeIcon(order.order_type)} {order.order_type === 'dine_in' ? 'Sur Place' : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</span>
                                            {order.table_number && <span className="text-[9px] lg:text-[10px] font-black text-zinc-900">Table {order.table_number}</span>}
                                        </div>
                                    </div>
                                    {order.delivery_address && <div className="mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2"><MapPin className="w-3.5 h-3.5 lg:w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><p className="text-[9px] lg:text-[10px] font-bold text-blue-900 line-clamp-2">{order.delivery_address}</p></div>}
                                    <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 flex-1 bg-zinc-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl">{order.items.map((item: any, i: number) => (<p key={i} className="text-xs lg:text-sm text-zinc-600 font-bold"><span className="font-black text-zinc-900 mr-2">{item.quantity}x</span> {item.name}</p>))}</div>
                                    <div className="flex items-center justify-between pt-4 lg:pt-6 border-t border-zinc-50">
                                        <span className="text-xl lg:text-2xl font-black text-emerald-600">{order.total_price.toLocaleString()} {currency}</span>
                                        {order.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                {staff?.can_cancel_orders !== false && (
                                                    <button onClick={() => updateWhatsAppStatus(order.id, 'CANCELLED')} className="p-2.5 lg:p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all"><XCircle className="w-5 h-5 lg:w-6 h-6" /></button>
                                                )}
                                                {staff?.can_validate_orders !== false && (
                                                    <button 
                                                        onClick={() => {
                                                            setConfirmingOrder(order);
                                                            setCustomerName(order.customer_name || '');
                                                            setDeliveryAddress(order.delivery_address || '');
                                                        }} 
                                                        className="bg-emerald-500 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-black uppercase text-[10px] lg:text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 h-4" /> Confirmer
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 items-end">
                                                <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${order.status === 'VALIDATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{order.status === 'VALIDATED' ? 'Validée' : 'Annulée'}</span>
                                                {order.status === 'VALIDATED' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${order.is_paid ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{order.is_paid ? 'Payé' : 'Non Payé'}</span>
                                                        <button onClick={() => updateWhatsAppPayment(order.id, !order.is_paid)} className={`px-4 py-2 rounded-xl font-black uppercase text-[8px] flex items-center gap-1.5 transition-all ${order.is_paid ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                                            {order.is_paid ? '✕ Non Payé' : '✓ Payé'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CASHIER */}
                {currentTab === 'cashier' && (
                    <div className="absolute inset-0 flex flex-col lg:flex-row animate-in fade-in duration-300">
                        <div className="flex-1 flex flex-col bg-[#fafafa] border-r overflow-hidden">
                            <header className="bg-white p-4 lg:p-6 border-b flex gap-2 overflow-x-auto no-scrollbar shrink-0">{categories.map(cat => (<button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase border-2 transition-all shrink-0 ${activeCategory === cat.id ? 'bg-[#c5a059] border-[#c5a059] text-[#064e3b]' : 'bg-white border-zinc-100 text-zinc-400'}`}>{cat.name}</button>))}</header>
                            <div className="flex-1 overflow-y-auto p-4 lg:p-8 grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-3 lg:gap-6 no-scrollbar pb-32">
                                {categories.find(c => c.id === activeCategory)?.dishes?.map((dish: any) => (
                                    <div key={dish.id} onClick={() => dish.is_available !== false && updateCart(dish.id, 1)} className={`group bg-white rounded-2xl lg:rounded-[2.5rem] border-2 transition-all cursor-pointer overflow-hidden flex flex-col relative ${dish.is_available === false ? 'opacity-50 grayscale' : ''} ${cart[dish.id] ? 'border-[#c5a059] shadow-xl' : 'border-white hover:border-zinc-200'}`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleDishAvailability(dish.id, dish.is_available !== false); }}
                                            className={`absolute top-2 right-2 lg:top-4 lg:right-4 z-10 p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all ${dish.is_available === false ? 'bg-red-500 text-white' : 'bg-white/90 text-zinc-400 hover:text-emerald-500 shadow-lg'}`}
                                            title={dish.is_available === false ? "Réactiver le plat" : "Marquer comme épuisé"}
                                        >
                                            <PackageCheck className="w-3.5 h-3.5 lg:w-4 h-4" />
                                        </button>
                                        {dish.image_url && <div className="aspect-[4/3] lg:aspect-video relative overflow-hidden"><img src={dish.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" /></div>}
                                        <div className="p-3 lg:p-6 flex-1 flex flex-col">
                                            <h4 className="font-black text-xs lg:text-lg text-zinc-900 leading-tight mb-1 lg:mb-2 line-clamp-2">{dish.name}</h4>
                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="text-sm lg:text-xl font-black text-[#c5a059]">{dish.price.toLocaleString()} {currency}</span>
                                                {cart[dish.id] && <div className="w-6 h-6 lg:w-10 lg:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] lg:text-base font-black animate-pop-in">{cart[dish.id]}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* MOBILE CART TOGGLE */}
                            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full px-6">
                                <button 
                                    onClick={() => setIsCartOpen(true)}
                                    className="w-full py-5 bg-[#064e3b] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Voir Panier ({Object.values(cart).reduce((a, b) => a + b, 0)})
                                    <span className="ml-2 px-3 py-1 bg-white/20 rounded-lg">{cartTotal.toLocaleString()} {currency}</span>
                                </button>
                            </div>
                        </div>

                        {/* CART SIDEBAR / MODAL */}
                        <div className={`fixed lg:relative inset-0 lg:inset-auto z-[100] lg:z-auto w-full lg:w-[480px] bg-white border-l shadow-2xl flex flex-col transition-transform duration-500 ${isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
                            <header className="lg:hidden p-6 border-b flex justify-between items-center bg-zinc-50">
                                <h3 className="font-black uppercase text-xs tracking-widest">Votre Panier</h3>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-xl shadow-sm"><X className="w-6 h-6" /></button>
                            </header>
                            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10 no-scrollbar">
                                <section><h3 className="hidden lg:flex font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-6 items-center gap-2"><ShoppingBag className="w-4 h-4 text-[#c5a059]" /> Panier Vente</h3><div className="space-y-3">{categories.flatMap(c => c.dishes).filter(d => cart[d.id]).map(dish => (<div key={dish.id} className="bg-zinc-50 p-4 lg:p-5 rounded-2xl lg:rounded-[1.5rem] border border-zinc-100 flex items-center justify-between"><div className="flex-1 min-w-0"><p className="font-black text-zinc-900 text-xs lg:text-sm truncate">{dish.name}</p><p className="text-[10px] font-bold text-[#c5a059]">{dish.price.toLocaleString()} {currency}</p></div><div className="flex items-center bg-white rounded-xl p-1 gap-2 shadow-sm"><button onClick={() => updateCart(dish.id, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900"><Minus className="w-4 h-4" /></button><span className="w-4 text-center font-black text-xs">{cart[dish.id]}</span><button onClick={() => updateCart(dish.id, 1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900"><Plus className="w-4 h-4" /></button></div></div>))}</div></section>

                                {paymentLogic === 'pay_before' && orders.filter(o => !o.is_paid && o.production_status === 'RECEIVED').length > 0 && (
                                    <section><h3 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp à encaisser</h3><div className="space-y-3">{orders.filter(o => !o.is_paid && o.production_status === 'RECEIVED').map(order => (<div key={order.id} className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm flex items-center justify-between animate-in slide-in-from-right-4">
                                        <div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><p className="font-black text-zinc-900 text-sm truncate">{order.customer_name || 'Client'}</p><span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">{order.order_type === 'dine_in' ? 'Sur Place' : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</span></div><p className="text-[10px] font-bold text-emerald-600 uppercase">#{order.id.slice(0, 6)} • {order.total_price.toLocaleString()} {currency}</p></div>
                                        <div className="flex gap-2">
                                            {staff?.can_cancel_orders !== false && <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><XCircle className="w-5 h-5" /></button>}
                                            {staff?.can_process_payments !== false && (
                                                <button onClick={() => updateOrderStatus(order.id, 'RECEIVED', true)} className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-2 transition-all"><CreditCard className="w-4 h-4" /> Encaisser</button>
                                            )}
                                        </div>
                                    </div>))}</div></section>
                                )}

                                <section><h3 className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-blue-500" /> Prêt à servir</h3><div className="space-y-3">{orders.filter(o => o.production_status === 'READY').map(order => (<div key={order.id} className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-center justify-between"><div><p className="font-black text-emerald-900 text-sm">{order.order_type === 'dine_in' ? `Table ${order.table_number}` : order.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</p><p className="text-[10px] font-bold text-emerald-600 uppercase">#{order.id.slice(0, 6)} • {order.total_price.toLocaleString()} {currency}</p></div>
                                <div className="flex gap-2">
                                    {staff?.can_cancel_orders !== false && <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="p-2 text-red-400 hover:bg-red-100 rounded-xl"><XCircle className="w-5 h-5" /></button>}
                                    {staff?.can_process_payments !== false && (
                                        <button onClick={() => updateOrderStatus(order.id, 'SERVED', true)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-black/10">Encaisser</button>
                                    )}
                                </div></div>))}</div></section>
                            </div>
                            <div className="p-6 lg:p-8 border-t bg-zinc-50/50 space-y-4 lg:space-y-6 shrink-0 pb-10 lg:pb-8">
                                <div className="flex bg-white p-1 rounded-2xl border">
                                    <button onClick={() => setManualType('dine_in')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'dine_in' ? 'bg-[#c5a059] text-white shadow-lg' : 'text-zinc-400'}`}>Sur place</button>
                                    <button onClick={() => setManualType('takeaway')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'takeaway' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400'}`}>Emporter</button>
                                    <button onClick={() => setManualType('delivery')} className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all ${manualType === 'delivery' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400'}`}>Livraison</button>
                                </div>
                                <div className="space-y-2 lg:space-y-3">
                                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                                        <input type="text" placeholder="Table" value={manualTable} onChange={e => setManualTable(e.target.value)} disabled={manualType !== 'dine_in'} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-center text-xs lg:text-base disabled:opacity-30 shadow-inner focus:bg-white transition-all" />
                                        <input type="text" placeholder="Client" value={manualName} onChange={e => setManualName(e.target.value)} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-xs lg:text-base shadow-inner focus:bg-white transition-all" />
                                    </div>
                                    {manualType === 'delivery' && <input type="text" placeholder="Adresse de livraison..." value={manualAddress} onChange={e => setManualAddress(e.target.value)} className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl border border-zinc-200 outline-none font-black text-xs lg:text-base shadow-inner focus:bg-white transition-all" />}
                                </div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-400">Total</span><span className="text-2xl lg:text-3xl font-black text-blue-900">{cartTotal.toLocaleString()} {currency}</span></div>
                                {staff?.can_validate_orders !== false && (
                                    <button 
                                        disabled={cartTotal === 0} 
                                        onClick={async () => { await submitManualOrder(); setIsCartOpen(false); }} 
                                        className={`w-full py-5 lg:py-6 text-white rounded-2xl lg:rounded-[2.5rem] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all ${paymentLogic === 'pay_before' ? 'bg-emerald-600' : 'bg-blue-600'}`}
                                    >
                                        {paymentLogic === 'pay_before' ? <><CreditCard className="w-5 h-5 lg:w-6 h-6" /> Encaisser</> : <><Send className="w-5 h-5 lg:w-6 h-6" /> Envoyer</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* KITCHEN */}
                {currentTab === 'kitchen' && (
                    <div className="absolute inset-0 p-4 lg:p-8 flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar animate-in fade-in duration-300">
                        {COLUMNS_KITCHEN.map(column => {
                            const columnOrders = orders.filter(o => o.production_status === column.id && (paymentLogic === 'pay_after' || o.is_paid))
                            return (
                                <div key={column.id} className={`flex-shrink-0 w-[85vw] lg:w-[480px] flex flex-col ${column.bgColor} rounded-[2rem] lg:rounded-[3rem] border ${column.borderColor} p-6 lg:p-8 shadow-sm`}>
                                    <div className="flex items-center justify-between mb-6 lg:mb-8 px-2"><h3 className={`font-black text-[10px] lg:text-xs uppercase tracking-widest ${column.textColor} flex items-center gap-2 lg:gap-3`}><span className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${column.accentColor} shadow-lg`} />{column.title}</h3><span className="bg-white border border-zinc-100 text-zinc-900 text-[9px] lg:text-[10px] font-black px-3 py-1 lg:px-4 lg:py-1.5 rounded-full shadow-sm">{columnOrders.length}</span></div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 lg:space-y-6 pr-1">
                                        {columnOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-zinc-100 shadow-sm p-5 lg:p-8 flex flex-col border-l-[8px] lg:border-l-[16px] transition-all hover:shadow-xl" style={{ borderLeftColor: order.order_type === 'dine_in' ? '#c5a059' : order.order_type === 'takeaway' ? '#1e293b' : '#3b82f6' }}>
                                                <div className="flex justify-between items-start mb-4 lg:mb-6"><div><div className="flex items-center gap-2 mb-1"><span className="font-black text-lg lg:text-2xl">#{order.id.slice(0, 6)}</span><span className="bg-zinc-50 text-zinc-700 text-[7px] lg:text-[8px] font-black uppercase px-1.5 py-0.5 rounded border flex items-center gap-1">{typeIcon(order.order_type)}</span></div><p className="text-[10px] lg:text-xs font-black text-zinc-900 uppercase tracking-widest truncate max-w-[120px]">{order.customer_name || 'Client'}</p></div><span className="text-[8px] lg:text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                {order.delivery_address && <div className="mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2"><MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 shrink-0 mt-0.5" /><p className="text-[9px] lg:text-[10px] font-bold text-blue-900 line-clamp-2">{order.delivery_address}</p></div>}
                                                <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 bg-zinc-50/50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl">{order.items.map((item: any, idx: number) => (<div key={idx} className="flex flex-col gap-1"><div className="flex justify-between text-xs lg:text-sm"><span className="font-bold text-zinc-800"><span className="text-zinc-400 mr-2">{item.quantity}x</span> {item.name}</span></div>{item.note && <p className="text-[9px] italic text-[#c5a059] bg-white p-2 rounded-xl border border-amber-100/50">"{item.note}"</p>}</div>))}</div>
                                                <div className="flex gap-2 lg:gap-3">
                                                    {staff?.can_cancel_orders !== false && <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="p-3 lg:p-5 bg-red-50 text-red-500 rounded-xl lg:rounded-[1.5rem] hover:bg-red-100 transition-all"><XCircle className="w-5 h-5 lg:w-7 h-7" /></button>}
                                                    <button onClick={() => handlePrint(order)} className="p-3 lg:p-5 bg-zinc-100 text-zinc-900 rounded-xl lg:rounded-[1.5rem] hover:bg-zinc-200 transition-all"><Printer className="w-5 h-5 lg:w-7 h-7" /></button>
                                                    {order.production_status === 'RECEIVED' ? <button onClick={() => updateOrderStatus(order.id, 'COOKING')} className="flex-1 py-4 lg:py-6 bg-blue-600 text-white rounded-xl lg:rounded-[1.5rem] font-black uppercase text-[10px] lg:text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 lg:gap-3">LANCER</button> : <button onClick={() => updateOrderStatus(order.id, paymentLogic === 'pay_before' ? 'SERVED' : 'READY')} className="flex-1 py-4 lg:py-6 bg-emerald-600 text-white rounded-xl lg:rounded-[1.5rem] font-black uppercase text-[10px] lg:text-xs shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 lg:gap-3">PRÊT</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* TRANSACTIONS */}
                {currentTab === 'transactions' && (
                    <div className="absolute inset-0 p-10 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
                        <div className="max-w-5xl mx-auto space-y-10">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div><h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic mb-2">Mes Transactions</h2><p className="text-zinc-400 text-sm font-bold">Historique de vos actions sur ce terminal.</p></div>
                                <div className="flex bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm"><button onClick={() => setTransFilter('ALL')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'ALL' ? 'bg-zinc-900 text-white' : 'text-zinc-400'}`}>Tout</button><button onClick={() => setTransFilter('SERVED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'SERVED' ? 'bg-emerald-500 text-white' : 'text-zinc-400'}`}>Payés</button><button onClick={() => setTransFilter('CANCELLED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'CANCELLED' ? 'bg-red-500 text-white' : 'text-zinc-400'}`}>Annulés</button></div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-[#064e3b] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between overflow-hidden relative"><Receipt className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" /><div><p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Chiffre d'Affaire</p><div className="text-4xl font-serif font-bold">{transactions.filter(t => t.production_status === 'SERVED').reduce((s, t) => s + (t.total_price || 0), 0).toLocaleString()} {currency}</div></div></div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col justify-between"><div><p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Commandes Servies</p><div className="text-4xl font-serif font-bold text-zinc-900">{transactions.filter(t => t.production_status === 'SERVED').length}</div></div></div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col justify-between"><div><p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Annulations / Pertes</p><div className="text-4xl font-serif font-bold text-red-500">{transactions.filter(t => t.production_status === 'CANCELLED').length}</div></div></div>
                            </div>

                            <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-50/50 border-b border-zinc-100"><tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400"><th className="px-8 py-6">ID / Heure</th><th className="px-8 py-6">Type / Client</th><th className="px-8 py-6">Contenu</th><th className="px-8 py-6">Total</th><th className="px-8 py-6">Statut</th></tr></thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {transactions.filter(t => transFilter === 'ALL' || t.production_status === transFilter).map(t => (
                                            <tr key={t.id} className="hover:bg-zinc-50/30 transition-colors">
                                                <td className="px-8 py-6"><div className="font-black text-zinc-900 text-sm">#{t.id.slice(0, 6)}</div><div className="text-[10px] text-zinc-400 font-bold">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
                                                <td className="px-8 py-6"><div className="flex items-center gap-2 mb-1"><span className="bg-zinc-100 text-zinc-700 text-[8px] font-black px-2 py-0.5 rounded border border-zinc-200 uppercase flex items-center gap-1">{typeIcon(t.order_type)} {t.order_type === 'dine_in' ? 'Sur Place' : t.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</span></div><div className="text-xs font-bold text-zinc-900">{t.customer_name || 'Anonyme'}</div></td>
                                                <td className="px-8 py-6 max-w-[200px]"><div className="truncate text-[10px] font-medium text-zinc-500">{t.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}</div></td>
                                                <td className="px-8 py-6"><div className="font-black text-zinc-900 text-sm">{t.total_price.toLocaleString()} {currency}</div></td>
                                                <td className="px-8 py-6 flex items-center gap-3">
                                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase border ${t.production_status === 'SERVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : t.production_status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{t.production_status}</span>
                                                    <button onClick={() => handlePrint(t)} className="p-2 text-zinc-400 hover:text-zinc-900 border border-zinc-100 rounded-lg"><Printer className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* STOCKS */}
                {currentTab === 'stocks' && (
                    <div className="absolute inset-0 p-8 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
                        <div className="max-w-5xl mx-auto space-y-12 pb-32">
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-4xl font-black text-zinc-900 uppercase">Gestion des Stocks</h2>
                                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">Activez ou désactivez vos plats en temps réel</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Chercher un plat (ex: Burger, Pizza...)"
                                        value={stockSearch}
                                        onChange={(e) => setStockSearch(e.target.value)}
                                        className="pl-14 pr-6 py-5 bg-white border-2 border-zinc-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059] transition-all w-full md:w-96 shadow-sm"
                                    />
                                </div>
                            </header>

                            <div className="space-y-10">
                                {categories.map(cat => {
                                    const filteredDishes = cat.dishes?.filter((d: any) => d.name.toLowerCase().includes(stockSearch.toLowerCase()))
                                    if (filteredDishes?.length === 0) return null

                                    return (
                                        <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em]">{cat.name}</h3>
                                                <div className="flex-1 h-px bg-zinc-100" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredDishes.map((dish: any) => (
                                                    <div key={dish.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${dish.is_available === false ? 'border-red-100 bg-red-50/10' : 'border-zinc-100 hover:border-emerald-100'}`}>
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative">
                                                                {dish.image_url ? (
                                                                    <img src={dish.image_url} className={`w-14 h-14 rounded-2xl object-cover transition-all ${dish.is_available === false ? 'grayscale opacity-50' : ''}`} />
                                                                ) : (
                                                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                                                                        <Utensils className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                                {dish.is_available === false && <XCircle className="w-5 h-5 text-red-500 absolute -top-2 -right-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-black text-sm transition-all ${dish.is_available === false ? 'text-zinc-400 line-through' : 'text-zinc-900 uppercase'}`}>{dish.name}</h4>
                                                                <p className="text-[10px] font-black text-[#c5a059] mt-1">{dish.price.toLocaleString()} {currency}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`text-[8px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl border transition-all ${dish.is_available !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                {dish.is_available !== false ? 'Disponible' : 'Épuisé'}
                                                            </span>
                                                            <button
                                                                onClick={() => toggleDishAvailability(dish.id, dish.is_available !== false)}
                                                                className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${dish.is_available !== false ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                                            >
                                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${dish.is_available !== false ? 'left-7' : 'left-1'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL CONFIRMATION WHATSAPP / LIVRAISON */}
            {confirmingOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingOrder(null)} />
                    <div className="relative bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-pop-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 uppercase">Confirmer la Commande</h2>
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">#{confirmingOrder.id.slice(0, 6)} • WhatsApp</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Nom du Client</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Samba Ndiaye" 
                                        value={customerName} 
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2">Adresse de Livraison</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Rue 10, Immeuble Nore, Dakar" 
                                        value={deliveryAddress} 
                                        onChange={e => setDeliveryAddress(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <p className="text-[9px] text-zinc-400 italic ml-2">Laissez vide si c'est une commande sur place ou à emporter.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmingOrder(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">Annuler</button>
                            <button 
                                onClick={handleConfirmWhatsApp}
                                className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-black transition-all"
                            >
                                <Check className="w-4 h-4" /> Envoyer en Cuisine
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINTABLE COMPONENT (Hidden in UI) */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 font-mono text-sm leading-tight text-black" ref={printRef}>
                {printingOrder && (
                    <div className="w-[80mm] mx-auto border-t-2 border-dashed border-black pt-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold uppercase">{restaurantName}</h2>
                            <p className="text-[10px]">TICKET DE CAISSE</p>
                            <p className="text-[10px]">{new Date().toLocaleString()}</p>
                        </div>

                        <div className="border-b border-dashed border-black pb-2 mb-4">
                            <p className="font-bold uppercase mb-1">Cde #{printingOrder.id.slice(0, 6)}</p>
                            <p className="text-[10px]">Type: {printingOrder.order_type === 'dine_in' ? 'Sur Place' : printingOrder.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</p>
                            {printingOrder.table_number && <p className="text-[10px]">Table: {printingOrder.table_number}</p>}
                            <p className="text-[10px]">Client: {printingOrder.customer_name || 'Anonyme'}</p>
                        </div>

                        <div className="space-y-2 mb-6">
                            {printingOrder.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-start gap-2">
                                    <span className="flex-1">{item.quantity}x {item.name}</span>
                                    <span className="whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-black pt-4 mb-8">
                            <div className="flex justify-between text-lg font-bold">
                                <span>TOTAL</span>
                                <span>{printingOrder.total_price.toLocaleString()} {currency}</span>
                            </div>
                        </div>

                        <div className="text-center text-[10px] italic">
                            <p>Merci de votre visite !</p>
                            <p>À bientôt chez {restaurantName}</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body * { visibility: hidden; }
                    .print\\:block, .print\\:block * { visibility: visible; }
                    .print\\:block { position: absolute; left: 0; top: 0; width: 80mm; }
                }
            `}</style>
        </div>
    )
}