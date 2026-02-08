'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle2, Clock, Utensils, PackageCheck, XCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderTrackingPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [restaurant, setRestaurant] = useState<any>(null)

    const orderId = params.orderId as string
    const restaurantId = params.id as string

    useEffect(() => {
        if (orderId) {
            fetchOrder()
            fetchRestaurant()

            // Subscribe to realtime updates
            const channel = supabase
                .channel(`order-updates-${orderId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `id=eq.${orderId}`,
                    },
                    (payload) => {
                        setOrder(payload.new)
                        toast.info(`Statut de la commande : ${getStatusLabel(payload.new.status)}`)
                        
                        // Play sound if order is ready
                        if (payload.new.status === 'ready') {
                            try {
                                const audio = new Audio('/notification.mp3')
                                audio.play().catch(e => console.log('Audio play blocked'))
                            } catch (e) {}
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [orderId])

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`)
            if (!res.ok) throw new Error('Failed to fetch order')
            const data = await res.json()
            setOrder(data)
        } catch (err) {
            console.error(err)
            toast.error('Erreur lors de la récupération de la commande')
        } finally {
            setLoading(false)
        }
    }

    const fetchRestaurant = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${restaurantId}`)
            const data = await res.json()
            setRestaurant(data.restaurant)
        } catch (err) {}
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente'
            case 'preparing': return 'En préparation'
            case 'ready': return 'Prêt'
            case 'delivered': return 'Servi'
            case 'cancelled': return 'Annulé'
            default: return status
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-8 h-8 text-amber-500" />
            case 'preparing': return <Utensils className="w-8 h-8 text-blue-500 animate-pulse" />
            case 'ready': return <PackageCheck className="w-8 h-8 text-emerald-500" />
            case 'delivered': return <CheckCircle2 className="w-8 h-8 text-zinc-400" />
            case 'cancelled': return <XCircle className="w-8 h-8 text-red-500" />
            default: return <Clock className="w-8 h-8" />
        }
    }

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 1
            case 'preparing': return 2
            case 'ready': return 3
            case 'delivered': return 4
            case 'cancelled': return 0
            default: return 1
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
    )

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <XCircle className="w-16 h-16 text-zinc-200 mb-4" />
            <h1 className="text-xl font-bold mb-2">Commande introuvable</h1>
            <button onClick={() => router.back()} className="text-zinc-500 underline">Retour au menu</button>
        </div>
    )

    const steps = [
        { id: 1, label: 'Attente', icon: Clock },
        { id: 2, label: 'Préparation', icon: Utensils },
        { id: 3, label: 'Prêt', icon: PackageCheck },
        { id: 4, label: 'Servi', icon: CheckCircle2 },
    ]

    const currentStep = getStatusStep(order.status)
    const brandColor = restaurant?.primary_color || '#4f46e5'

    return (
        <div className="min-h-screen bg-[#fafafa] text-zinc-900 pb-20">
            <header className="bg-white border-b px-6 py-5 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => router.push(`/menu/${restaurantId}`)} className="p-2 hover:bg-zinc-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-black tracking-tight">Suivi de commande</h1>
            </header>

            <main className="max-w-md mx-auto p-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 mb-6 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                            {getStatusIcon(order.status)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-black mb-1">{getStatusLabel(order.status)}</h2>
                    <p className="text-zinc-500 text-sm font-medium">Commande #{order.id.slice(0, 8)}</p>
                </div>

                {order.status !== 'cancelled' && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 mb-6">
                        <div className="relative flex justify-between">
                            {/* Progress Line */}
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-zinc-100 -z-0">
                                <div 
                                    className="h-full transition-all duration-1000" 
                                    style={{ 
                                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                        backgroundColor: brandColor
                                    }} 
                                />
                            </div>

                            {steps.map((step) => {
                                const Icon = step.icon
                                const isActive = currentStep >= step.id
                                const isCurrent = currentStep === step.id

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div 
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                                isActive 
                                                    ? 'bg-white' 
                                                    : 'bg-zinc-50 border-zinc-100 text-zinc-300'
                                            }`}
                                            style={isActive ? { borderColor: brandColor, color: brandColor } : {}}
                                        >
                                            <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100">
                    <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-6">Détails</h3>
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                                    <span className="font-bold text-sm">{item.name}</span>
                                </div>
                                <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} {restaurant?.currency || 'FCFA'}</span>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-dashed flex justify-between items-center">
                            <span className="font-black text-sm uppercase tracking-widest">Total</span>
                            <span className="font-black text-xl" style={{ color: brandColor }}>{order.total_price.toLocaleString()} {restaurant?.currency || 'FCFA'}</span>
                        </div>
                    </div>
                </div>

                {order.table_number && (
                    <div className="mt-4 px-8 text-center">
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Table {order.table_number}</p>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t flex justify-center">
                <button 
                    onClick={() => router.push(`/menu/${restaurantId}`)}
                    className="w-full max-w-md py-4 rounded-2xl font-black text-white shadow-xl active:scale-95 transition-all"
                    style={{ backgroundColor: brandColor }}
                >
                    Retour au menu
                </button>
            </footer>
        </div>
    )
}
