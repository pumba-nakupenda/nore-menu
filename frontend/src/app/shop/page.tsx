'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChefHat, ShoppingBag, Plus, Minus, X, Truck, ShieldCheck, CreditCard, ChevronLeft, Star, Loader2 } from 'lucide-react'

export default function ShopPage() {
    const [items, setItems] = useState<any[]>([])
    const [cart, setCart] = useState<Record<string, number>>({})
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            // FETCH REAL HARDWARE PRODUCTS
            const { data, error } = await supabase
                .from('hardware_products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            
            if (data) setItems(data)
            setLoading(false)
        }
        loadProducts()
        
        const saved = localStorage.getItem('nore_shop_cart')
        if (saved) {
            try { setCart(JSON.parse(saved)) } catch(e) {}
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('nore_shop_cart', JSON.stringify(cart))
    }, [cart])

    const updateQty = (title: string, delta: number) => {
        setCart(prev => {
            const next = Math.max(0, (prev[title] || 0) + delta)
            if (next === 0) { const { [title]: _, ...rest } = prev; return rest; }
            return { ...prev, [title]: next }
        })
    }

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
    // Using title and image_url from real table
    const cartTotal = items.reduce((sum, item) => sum + (cart[item.title] || 0) * (item.price || 0), 0)

    const sendOrder = () => {
        let msg = `📦 *Commande Hardware - Nore Menu*\n\n`
        Object.entries(cart).forEach(([t, q]) => msg += `• ${q}x ${t}\n`)
        msg += `\nTotal estimé : ${cartTotal.toLocaleString()} FCFA\nMerci de me recontacter.`
        window.open(`https://wa.me/221772354747?text=${encodeURIComponent(msg)}`, '_blank')
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]"><Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" /></div>

    return (
        <div className="min-h-screen bg-[#fdfcfb] text-zinc-900 font-sans selection:bg-[#064e3b]/10 selection:text-[#064e3b]">
            <header className="fixed top-0 w-full z-50 border-b border-black/5 bg-[#fdfcfb]/80 backdrop-blur-md h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:-translate-x-1 transition-transform" />
                        <div className="bg-[#064e3b] text-white p-2 rounded-xl shadow-lg"><ChefHat className="w-5 h-5" /></div>
                        <span className="text-xl font-serif font-bold tracking-tight text-[#064e3b]">Nore Store</span>
                    </Link>
                    <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:scale-105 transition-all">
                        <ShoppingBag className="w-6 h-6 text-[#064e3b]" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#b48a4d] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
                    </button>
                </div>
            </header>

            <main className="pt-40 pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-[#064e3b] rounded-full mb-6 border border-emerald-100">
                            <Star className="w-3 h-3 fill-[#b48a4d] text-[#b48a4d]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Le Shop Officiel</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-8 leading-[0.9]">Équipements <br /><span className="italic text-[#b48a4d]">Signature.</span></h1>
                        <p className="text-xl text-zinc-500 font-medium italic max-w-xl">Commandez vos supports physiques certifiés Nore Menu. Tous nos produits sont livrés pré-configurés.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {items.length > 0 ? items.map((item, i) => (
                            <div key={item.id || i} className="group flex flex-col bg-white rounded-[3rem] border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-700">
                                <div className="aspect-square relative overflow-hidden bg-zinc-50 border-b border-zinc-50">
                                    {item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />}
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-[#064e3b] border border-black/5 shadow-sm">{item.tag || "Produit"}</div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="font-serif font-bold text-2xl mb-2 text-zinc-900">{item.title}</h3>
                                    <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-8 flex-1">{item.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-[#064e3b]">{item.price?.toLocaleString() || 0}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Francs CFA</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-zinc-50 rounded-2xl p-1.5 border border-zinc-100">
                                            {cart[item.title] > 0 ? (
                                                <>
                                                    <button onClick={() => updateQty(item.title, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500"><Minus className="w-4 h-4" /></button>
                                                    <span className="w-4 text-center font-black text-sm">{cart[item.title]}</span>
                                                    <button onClick={() => updateQty(item.title, 1)} className="w-8 h-8 bg-[#064e3b] text-white rounded-xl flex items-center justify-center shadow-lg"><Plus className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => updateQty(item.title, 1)} className="px-6 py-2.5 bg-white text-[#064e3b] text-[10px] font-black uppercase tracking-widest border border-zinc-200 rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm">Acheter</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
                                <ShoppingBag className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-400 italic">Aucun produit n'est disponible pour le moment.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-100 pt-20">
                        {[
                            { icon: <Truck />, t: "Livraison Express", d: "Expédition dans tout le Sénégal et la sous-région sous 48h." },
                            { icon: <ShieldCheck />, t: "Prêt à l'emploi", d: "Tous nos supports arrivent pré-configurés avec votre menu." },
                            { icon: <CreditCard />, t: "Paiement Sécurisé", d: "Payez par Wave, Orange Money ou Carte Bancaire." }
                        ].map((f, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center text-[#b48a4d] shadow-sm shrink-0">{f.icon}</div>
                                <div><h4 className="font-black text-sm uppercase tracking-widest mb-2">{f.t}</h4><p className="text-zinc-400 text-sm font-medium leading-relaxed">{f.d}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md h-full bg-[#fdfcfb] shadow-2xl flex flex-col">
                        <header className="p-10 border-b border-zinc-100 flex justify-between items-center">
                            <div><h2 className="text-3xl font-serif font-bold">Votre <span className="italic text-[#b48a4d]">Panier</span></h2><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Équipement Nore Signature</p></div>
                            <button onClick={() => setIsCartOpen(false)} className="p-3 bg-zinc-50 rounded-2xl"><X className="w-6 h-6 text-zinc-400" /></button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                            {Object.entries(cart).map(([t, q]) => (
                                <div key={t} className="flex items-center justify-between group">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-black text-zinc-900 truncate">{t}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Accessoire Connecté</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-zinc-50 p-1 rounded-xl border border-zinc-100 ml-6">
                                        <button onClick={() => updateQty(t, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400"><Minus className="w-3 h-3" /></button>
                                        <span className="font-black text-sm">{q}</span>
                                        <button onClick={() => updateQty(t, 1)} className="w-8 h-8 bg-[#064e3b] text-white rounded-lg flex items-center justify-center shadow-md"><Plus className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            {cartCount === 0 && <div className="text-center py-20 italic text-zinc-400">Votre panier est vide...</div>}
                        </div>
                        <footer className="p-10 bg-zinc-50 border-t border-zinc-100 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase text-zinc-400">Total Commande</span>
                                <span className="text-3xl font-black text-[#064e3b]">{cartTotal.toLocaleString()} FCFA</span>
                            </div>
                            <button disabled={cartCount === 0} onClick={sendOrder} className="w-full py-6 bg-[#064e3b] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-[#053e2f] transition-all disabled:opacity-30">
                                Commander via WhatsApp
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    )
}