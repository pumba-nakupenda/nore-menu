'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChefHat, Coins, Utensils, MessageCircle, History, Layers, LogOut, Printer, Receipt, Search, XCircle } from 'lucide-react'
import { useOrderTracking } from '@/hooks/useOrderTracking'
import KanbanBoard from '@/components/pos/KanbanBoard'
import CashierPanel from '@/components/pos/CashierPanel'
import WhatsAppPanel from '@/components/pos/WhatsAppPanel'
import { typeIcon } from '@/components/pos/OrderCard'

export default function POSDashboardPage() {
    const [staff, setStaff] = useState<any>(null)
    const [currentTab, setCurrentTab] = useState<string>('')
    const [transFilter, setTransFilter] = useState('ALL')
    const [stockSearch, setStockSearch] = useState('')
    const [printingOrder, setPrintingOrder] = useState<any>(null)
    const printRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const { orders, whatsappOrders, transactions, categories, connectionStatus, restaurantName, currency, paymentLogic, loading, setLoading, updateOrderStatus, updateWhatsAppStatus, updateWhatsAppPayment, toggleDishAvailability, submitManualOrder } = useOrderTracking(staff)

    useEffect(() => {
        const sessionStr = localStorage.getItem('nore_pos_session')
        if (!sessionStr) { router.push('/pos/login'); return }
        let staffData: any
        try {
            staffData = JSON.parse(sessionStr)
            if (!staffData || !staffData.id || !staffData.restaurant_id) throw new Error('Donnees de session incompletes')
            setStaff(staffData)
        } catch {
            localStorage.removeItem('nore_pos_session')
            router.push('/pos/login')
            return
        }
        if (staffData.can_view_cashier) setCurrentTab('cashier')
        else if (staffData.can_view_whatsapp) setCurrentTab('whatsapp')
        else if (staffData.can_view_kitchen) setCurrentTab('kitchen')
        else setCurrentTab('transactions')
    }, [])

    const handleLogout = () => { localStorage.removeItem('nore_pos_session'); router.push('/pos/login') }
    const handlePrint = (order: any) => { setPrintingOrder(order); setTimeout(() => { window.print(); setPrintingOrder(null) }, 100) }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-brand" /><p className="text-xs font-black uppercase tracking-widest text-zinc-400">Chargement du Terminal...</p></div></div>

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans overflow-hidden">
            <header className="bg-brand-dark text-white p-3 lg:p-4 flex justify-between items-center shadow-xl shrink-0">
                <div className="flex items-center gap-2 lg:gap-6">
                    <div className="flex items-center gap-2 lg:gap-4 border-r border-white/10 pr-3 lg:pr-6 mr-1 lg:mr-2"><div className="bg-gold p-1.5 lg:p-2 rounded-lg lg:rounded-xl text-brand shadow-lg"><ChefHat className="w-4 h-4 lg:w-5 lg:h-5" /></div><h1 className="font-black tracking-tighter text-sm lg:text-lg truncate max-w-[80px] lg:max-w-none">{restaurantName}</h1></div>
                    <nav className="flex bg-white/5 p-1 rounded-xl lg:rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                        {staff?.can_view_whatsapp && <button onClick={() => setCurrentTab('whatsapp')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'whatsapp' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><MessageCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">WhatsApp</span> {whatsappOrders.length > 0 && <span className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[7px]">{whatsappOrders.length}</span>}</button>}
                        {staff?.can_view_cashier && <button onClick={() => setCurrentTab('cashier')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'cashier' ? 'bg-gold text-brand' : 'text-white/40 hover:text-white'}`}><Coins className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Caisse</span></button>}
                        {staff?.can_view_kitchen && <button onClick={() => setCurrentTab('kitchen')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'kitchen' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><Utensils className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Cuisine</span> {orders.length > 0 && <span className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[7px]">{orders.length}</span>}</button>}
                        {staff?.can_manage_stocks && <button onClick={() => setCurrentTab('stocks')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'stocks' ? 'bg-amber-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}><Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Stocks</span></button>}
                        {staff?.can_view_transactions && <button onClick={() => setCurrentTab('transactions')} className={`px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 ${currentTab === 'transactions' ? 'bg-zinc-100 text-zinc-900 shadow-lg' : 'text-white/40 hover:text-white'}`}><History className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden xs:inline">Ventes</span></button>}
                    </nav>
                </div>
                <div className="flex items-center gap-2 lg:gap-4">
                    <div className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border hidden sm:flex items-center gap-1.5 lg:gap-2 ${paymentLogic === 'pay_before' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full animate-pulse ${paymentLogic === 'pay_before' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{paymentLogic === 'pay_before' ? 'Pre-paye' : 'Post-paye'}</span>
                    </div>
                    <div className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full border flex items-center gap-1.5 lg:gap-2 ${connectionStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : connectionStatus === 'connecting' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-bounce'}`} />
                        <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{connectionStatus === 'connected' ? 'Live' : 'Synchro'}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 lg:p-3 bg-white/5 hover:bg-red-500/20 text-white rounded-xl lg:rounded-2xl transition-all"><LogOut className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" /></button>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden">
                {currentTab === 'whatsapp' && <WhatsAppPanel whatsappOrders={whatsappOrders} staff={staff} currency={currency} loading={loading} setLoading={setLoading} onUpdateWhatsAppStatus={updateWhatsAppStatus} onUpdateWhatsAppPayment={updateWhatsAppPayment} />}
                {currentTab === 'cashier' && <CashierPanel categories={categories} orders={orders} staff={staff} currency={currency} paymentLogic={paymentLogic} onToggleDishAvailability={toggleDishAvailability} onUpdateOrderStatus={updateOrderStatus} onSubmitManualOrder={submitManualOrder} />}
                {currentTab === 'kitchen' && <KanbanBoard orders={orders} staff={staff} paymentLogic={paymentLogic} onUpdateStatus={updateOrderStatus} onPrint={handlePrint} />}

                {currentTab === 'transactions' && (
                    <div className="absolute inset-0 p-10 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
                        <div className="max-w-5xl mx-auto space-y-10">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div><h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic mb-2">Mes Transactions</h2><p className="text-zinc-400 text-sm font-bold">Historique de vos actions sur ce terminal.</p></div>
                                <div className="flex bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm"><button onClick={() => setTransFilter('ALL')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'ALL' ? 'bg-zinc-900 text-white' : 'text-zinc-400'}`}>Tout</button><button onClick={() => setTransFilter('SERVED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'SERVED' ? 'bg-emerald-500 text-white' : 'text-zinc-400'}`}>Payes</button><button onClick={() => setTransFilter('CANCELLED')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${transFilter === 'CANCELLED' ? 'bg-red-500 text-white' : 'text-zinc-400'}`}>Annules</button></div>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-brand p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between overflow-hidden relative"><Receipt className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" /><div><p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Chiffre d'Affaire</p><div className="text-4xl font-serif font-bold">{transactions.filter(t => t.production_status === 'SERVED').reduce((s, t) => s + (t.total_price || 0), 0).toLocaleString()} {currency}</div></div></div>
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

                {currentTab === 'stocks' && (
                    <div className="absolute inset-0 p-8 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
                        <div className="max-w-5xl mx-auto space-y-12 pb-32">
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div><h2 className="text-4xl font-black text-zinc-900 uppercase">Gestion des Stocks</h2><p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">Activez ou desactivez vos plats en temps reel</p></div>
                                <div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input type="text" placeholder="Chercher un plat (ex: Burger, Pizza...)" value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} className="pl-14 pr-6 py-5 bg-white border-2 border-zinc-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all w-full md:w-96 shadow-sm" /></div>
                            </header>
                            <div className="space-y-10">
                                {categories.map(cat => {
                                    const filteredDishes = cat.dishes?.filter((d: any) => d.name.toLowerCase().includes(stockSearch.toLowerCase()))
                                    if (filteredDishes?.length === 0) return null
                                    return (
                                        <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-4 mb-4"><h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em]">{cat.name}</h3><div className="flex-1 h-px bg-zinc-100" /></div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredDishes.map((dish: any) => (
                                                    <div key={dish.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${dish.is_available === false ? 'border-red-100 bg-red-50/10' : 'border-zinc-100 hover:border-emerald-100'}`}>
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative">
                                                                {dish.image_url ? (<img src={dish.image_url} className={`w-14 h-14 rounded-2xl object-cover transition-all ${dish.is_available === false ? 'grayscale opacity-50' : ''}`} />) : (<div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400"><Utensils className="w-6 h-6" /></div>)}
                                                                {dish.is_available === false && <XCircle className="w-5 h-5 text-red-500 absolute -top-2 -right-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div><h4 className={`font-black text-sm transition-all ${dish.is_available === false ? 'text-zinc-400 line-through' : 'text-zinc-900 uppercase'}`}>{dish.name}</h4><p className="text-[10px] font-black text-gold mt-1">{dish.price.toLocaleString()} {currency}</p></div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`text-[8px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl border transition-all ${dish.is_available !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{dish.is_available !== false ? 'Disponible' : 'Epuise'}</span>
                                                            <button onClick={() => toggleDishAvailability(dish.id, dish.is_available !== false)} className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${dish.is_available !== false ? 'bg-emerald-500' : 'bg-zinc-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${dish.is_available !== false ? 'left-7' : 'left-1'}`} /></button>
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

            {/* PRINTABLE COMPONENT (Hidden in UI) */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 font-mono text-sm leading-tight text-black" ref={printRef}>
                {printingOrder && (
                    <div className="w-[80mm] mx-auto border-t-2 border-dashed border-black pt-4">
                        <div className="text-center mb-6"><h2 className="text-xl font-bold uppercase">{restaurantName}</h2><p className="text-[10px]">TICKET DE CAISSE</p><p className="text-[10px]">{new Date().toLocaleString()}</p></div>
                        <div className="border-b border-dashed border-black pb-2 mb-4"><p className="font-bold uppercase mb-1">Cde #{printingOrder.id.slice(0, 6)}</p><p className="text-[10px]">Type: {printingOrder.order_type === 'dine_in' ? 'Sur Place' : printingOrder.order_type === 'takeaway' ? 'Emporter' : 'Livraison'}</p>{printingOrder.table_number && <p className="text-[10px]">Table: {printingOrder.table_number}</p>}<p className="text-[10px]">Client: {printingOrder.customer_name || 'Anonyme'}</p></div>
                        <div className="space-y-2 mb-6">{printingOrder.items?.map((item: any, i: number) => (<div key={i} className="flex justify-between items-start gap-2"><span className="flex-1">{item.quantity}x {item.name}</span><span className="whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}</span></div>))}</div>
                        <div className="border-t-2 border-black pt-4 mb-8"><div className="flex justify-between text-lg font-bold"><span>TOTAL</span><span>{printingOrder.total_price.toLocaleString()} {currency}</span></div></div>
                        <div className="text-center text-[10px] italic"><p>Merci de votre visite !</p><p>A bientot chez {restaurantName}</p></div>
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
