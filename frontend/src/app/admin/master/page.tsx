'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Save, 
    RefreshCw, 
    Layout, 
    Smartphone, 
    Workflow, 
    CreditCard, 
    BarChart3, 
    ShoppingBag, 
    Users, 
    QrCode, 
    TrendingUp, 
    ChevronRight,
    Search,
    Filter,
    Store,
    ShieldCheck,
    LayoutDashboard,
    Image as ImageIcon,
    Plus,
    Trash2,
    CheckCircle2,
    Tag,
    Eye,
    Target,
    Zap,
    ArrowUpRight,
    Upload,
    Loader2,
    Clock,
    Layers
} from 'lucide-react'
import { toast } from 'sonner'
import Magnetic from '@/components/Magnetic'

export default function MasterAdmin() {
    const [loading, setLoading] = useState(true)
    const [saving, setSave] = useState(false)
    const [activeTab, setActiveTab] = useState<'analytics' | 'shops' | 'hardware' | 'content'>('analytics')
    const [stats, setStats] = useState<any>(null)
    const [searchTerm, setSearchSearchTerm] = useState('')
    const [hardwareItems, setHardwareItems] = useState<any[]>([])
    const [uploadingIdx, setUploadingIdx] = useState<string | number | null>(null)
    const [uploadingHero, setUploadingHero] = useState(false)
    const [uploadingSolution, setUploadingSolution] = useState(false)
    
    const [siteContent, setSiteContent] = useState<any>({
        hero: { title: "Digitalisez\nL'Excellence", subtitle: "Système complet de Commande WhatsApp & POS pour les restaurants premium.", image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" },
        solution: { title: "Un écosystème\nsans failles.", description: "Nore Menu résout la lenteur du service et les erreurs de commande.", image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" },
        flow: { title: "Le Flux", steps: [] },
        pricing: { title: "L'Investissement", plans: [] }
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/global-stats`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            const statsData = await response.json()
            setStats(statsData)

            const { data: products } = await supabase.from('hardware_products').select('*').order('created_at', { ascending: false })
            if (products) setHardwareItems(products)

            const { data: contentData } = await supabase.from('site_content').select('*')
            if (contentData && contentData.length > 0) {
                const contentObj = contentData.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.value }), {})
                setSiteContent((prev: any) => ({ ...prev, ...contentObj }))
            }
        } catch (error) {
            toast.error("Erreur de synchronisation")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveContent = async (section: string) => {
        setSave(true)
        try {
            const { error } = await supabase.from('site_content').upsert({ key: section, value: siteContent[section] })
            if (error) throw error
            toast.success(`Section "${section}" mise à jour`)
        } catch (error) {
            toast.error("Erreur d'enregistrement")
        } finally {
            setSave(false)
        }
    }

    const handleHardwareSave = async (item: any) => {
        setSave(true)
        try {
            const { error } = await supabase.from('hardware_products').upsert({
                id: item.id.toString().includes('.') ? undefined : item.id,
                title: item.title,
                description: item.description,
                price: Number(item.price),
                image_url: item.image_url,
                tag: item.tag,
                is_active: item.is_active ?? true
            })
            if (error) throw error
            toast.success(`${item.title} enregistré`)
            fetchData()
        } catch (error) {
            toast.error("Erreur enregistrement")
        } finally {
            setSave(false)
        }
    }

    const deleteHardware = async (id: any) => {
        if (!confirm("Supprimer ?")) return
        const { error } = await supabase.from('hardware_products').delete().eq('id', id)
        if (!error) { toast.success("Supprimé"); fetchData(); }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void, identifier: string | number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingIdx(identifier)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const formData = new FormData(); formData.append('file', file); formData.append('path', path)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avif`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}` }, body: formData
            })
            const data = await res.json()
            if (data.url) { callback(data.url); toast.success("Image optimisée") }
        } catch (error) { toast.error("Erreur upload") } finally { setUploadingIdx(null) }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]"><RefreshCw className="w-10 h-10 animate-spin text-[#064e3b]" /></div>

    const filteredShops = stats?.shops?.filter((s: any) => s.name?.toLowerCase().includes(searchTerm.toLowerCase())) || []
    const conversionRate = stats ? (stats.totalWhatsAppOrders / stats.totalScans) * 100 : 0

    return (
        <div className="min-h-screen bg-[#fdfcfb] font-sans selection:bg-[#064e3b]/10 pb-40">
            <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-black/5 pb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold flex items-center gap-3">Master Control <ShieldCheck className="w-6 h-6 text-[#b48a4d]" /></h1>
                        <p className="text-zinc-500 font-medium italic">Business Intelligence & Design Public</p>
                    </div>
                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                        {[
                            { id: 'analytics', label: 'Tracking', icon: BarChart3 },
                            { id: 'shops', label: 'Boutiques', icon: Store },
                            { id: 'hardware', label: 'Vrai Shop', icon: ShoppingBag },
                            { id: 'content', label: 'Design Site', icon: Layout }
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-[#064e3b] shadow-md' : 'text-zinc-400'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {/* TRACKING / ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <KpiCard label="Chiffre d'Affaire" value={`${stats?.totalRevenue?.toLocaleString()} FCFA`} icon={TrendingUp} color="text-emerald-600" />
                                <KpiCard label="Conversion" value={`${conversionRate.toFixed(1)}%`} icon={Target} color="text-[#b48a4d]" />
                                <KpiCard label="Restaurants" value={stats?.totalRestaurants} icon={Store} color="text-zinc-900" />
                                <KpiCard label="Scans Totaux" value={stats?.totalScans} icon={QrCode} color="text-blue-600" />
                            </div>

                            <div className="grid lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-8">
                                    <h3 className="text-xl font-serif font-bold italic">Top Performance Boutiques</h3>
                                    <div className="space-y-4">
                                        {stats?.topShops?.map((shop: any, i: number) => (
                                            <div key={shop.id} className="flex items-center justify-between p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100/50 hover:border-[#b48a4d]/20 transition-all">
                                                <div className="flex items-center gap-6"><span className="text-xl font-serif font-bold opacity-20">0{i + 1}</span><p className="font-bold">{shop.name}</p></div>
                                                <p className="font-black text-[#064e3b]">{shop.revenue.toLocaleString()} FCFA</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-8">
                                        <h3 className="text-lg font-serif font-bold italic text-center text-zinc-400 uppercase tracking-widest">Croissance Hebdo</h3>
                                        <div className="h-40 flex items-end gap-3 px-2">
                                            {[40, 70, 55, 90, 65, 80, 100].map((h, i) => (
                                                <div key={i} className="flex-1 bg-zinc-50 rounded-t-xl relative group">
                                                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-[#064e3b]/10 group-hover:bg-[#064e3b]/20 transition-colors rounded-t-xl" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black uppercase text-zinc-300 px-2">
                                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
                                        </div>
                                    </div>
                                    <div className="bg-[#064e3b] p-10 rounded-[3rem] text-white space-y-4 shadow-xl">
                                        <Zap className="w-6 h-6 text-[#b48a4d]" />
                                        <h4 className="text-2xl font-serif font-bold italic leading-tight">Vitalité Plateforme</h4>
                                        <p className="text-sm opacity-60">{stats?.totalDishes} plats actifs.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* HARDWARE SHOP */}
                    {activeTab === 'hardware' && (
                        <motion.div key="hardware" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
                            <div className="col-span-full flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-black/5">
                                <h2 className="text-xl font-serif font-bold">Gestion Catalogue Réel</h2>
                                <button onClick={() => setHardwareItems([{id: Math.random(), title: "Nouveau", price: 0, tag: "Signature", image_url: "", description: "", is_active: true}, ...hardwareItems])} className="px-8 py-3 bg-[#064e3b] text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
                            </div>
                            {hardwareItems.map((item, idx) => (
                                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-black/5 space-y-6 relative shadow-sm">
                                    <button onClick={() => deleteHardware(item.id)} className="absolute top-6 right-6 p-2 text-red-400 opacity-0 hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Titre" value={item.title} onChange={(v: string) => { const n = [...hardwareItems]; n[idx].title = v; setHardwareItems(n); }} />
                                        <Input label="Prix" value={item.price} onChange={(v: string) => { const n = [...hardwareItems]; n[idx].price = v; setHardwareItems(n); }} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image URL / Upload</label>
                                        <div className="flex gap-4">
                                            <input type="text" value={item.image_url} onChange={(e) => { const n = [...hardwareItems]; n[idx].image_url = e.target.value; setHardwareItems(n); }} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs" />
                                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                                {uploadingIdx === item.id ? <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hardware', (url) => { const n = [...hardwareItems]; n[idx].image_url = url; setHardwareItems(n); }, item.id)} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="aspect-video relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                                        {item.image_url && <Image src={item.image_url} alt="Preview" fill className="object-cover" unoptimized />}
                                    </div>
                                    <button onClick={() => handleHardwareSave(item)} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Enregistrer Produit</button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* DESIGN SITE */}
                    {activeTab === 'content' && (
                        <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            {/* HERO SECTION */}
                            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Layout className="w-6 h-6 text-[#b48a4d]" /> 1. Section Hero</h2>
                                    <button disabled={saving} onClick={() => handleSaveContent('hero')} className="px-8 py-3 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase">Publier</button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <Input label="Titre Principal" value={siteContent.hero?.title} onChange={(v: string) => setSiteContent({...siteContent, hero: {...siteContent.hero, title: v}})} />
                                        <Textarea label="Description" value={siteContent.hero?.subtitle} onChange={(v: string) => setSiteContent({...siteContent, hero: {...siteContent.hero, subtitle: v}})} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image Hero (URL/Upload)</label>
                                        <div className="flex gap-4">
                                            <input type="text" value={siteContent.hero?.image_url} onChange={(e) => setSiteContent({...siteContent, hero: {...siteContent.hero, image_url: e.target.value}})} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs outline-none" />
                                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                                {uploadingIdx === 'hero' ? <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero', (url) => setSiteContent({...siteContent, hero: {...siteContent.hero, image_url: url}}), 'hero')} />
                                            </label>
                                        </div>
                                        <div className="aspect-video relative rounded-3xl overflow-hidden border border-zinc-100">
                                            {siteContent.hero?.image_url && <Image src={siteContent.hero.image_url} alt="Hero" fill className="object-cover" unoptimized />}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION SOLUTION SECTION */}
                            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Smartphone className="w-6 h-6 text-[#b48a4d]" /> 2. Section Solution (Écosystème)</h2>
                                    <button disabled={saving} onClick={() => handleSaveContent('solution')} className="px-8 py-3 bg-[#064e3b] text-white rounded-full text-[10px] font-black uppercase">Publier Solution</button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <Input label="Titre Solution" value={siteContent.solution?.title} onChange={(v: string) => setSiteContent({...siteContent, solution: {...siteContent.solution, title: v}})} />
                                        <Textarea label="Description Solution" value={siteContent.solution?.description} onChange={(v: string) => setSiteContent({...siteContent, solution: {...siteContent.solution, description: v}})} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image Solution</label>
                                        <div className="flex gap-4">
                                            <input type="text" value={siteContent.solution?.image_url} onChange={(e) => setSiteContent({...siteContent, solution: {...siteContent.solution, image_url: e.target.value}})} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs outline-none" />
                                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                                {uploadingIdx === 'sol' ? <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'solution', (url) => setSiteContent({...siteContent, solution: {...siteContent.solution, image_url: url}}), 'sol')} />
                                            </label>
                                        </div>
                                        <div className="aspect-video relative rounded-3xl overflow-hidden border border-zinc-100">
                                            {siteContent.solution?.image_url && <Image src={siteContent.solution.image_url} alt="Sol" fill className="object-cover" unoptimized />}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION VOYAGE (FLOW) */}
                            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Workflow className="w-6 h-6 text-[#b48a4d]" /> 3. Section Voyage (Le Flux)</h2>
                                    <button disabled={saving} onClick={() => handleSaveContent('flow')} className="px-8 py-3 bg-[#064e3b] text-white rounded-full text-[10px] font-black uppercase">Publier Voyage</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[0, 1, 2].map((idx) => {
                                        const step = siteContent.flow?.steps?.[idx] || { n: `0${idx+1}`, t: "", d: "", img: "" };
                                        return (
                                            <div key={idx} className="p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-4">
                                                <Input label={`Étape ${step.n} - Titre`} value={step.t} onChange={(v) => {
                                                    const steps = [...(siteContent.flow?.steps || [])];
                                                    steps[idx] = { ...step, t: v };
                                                    setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                                }} />
                                                <Textarea label="Description" value={step.d} onChange={(v) => {
                                                    const steps = [...(siteContent.flow?.steps || [])];
                                                    steps[idx] = { ...step, d: v };
                                                    setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                                }} />
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="URL Image" value={step.img} onChange={(e) => {
                                                            const steps = [...(siteContent.flow?.steps || [])];
                                                            steps[idx] = { ...step, img: e.target.value };
                                                            setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                                        }} className="flex-1 p-3 bg-white border border-zinc-200 rounded-xl text-[10px] outline-none" />
                                                        <label className="p-3 bg-white border border-zinc-200 rounded-xl cursor-pointer">
                                                            {uploadingIdx === `flow-${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'flow', (url) => {
                                                                const steps = [...(siteContent.flow?.steps || [])];
                                                                steps[idx] = { ...step, img: url };
                                                                setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                                            }, `flow-${idx}`)} />
                                                        </label>
                                                    </div>
                                                    <div className="aspect-video relative rounded-2xl overflow-hidden border border-zinc-200">
                                                        {step.img && <Image src={step.img} alt="Step" fill className="object-cover" unoptimized />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* SECTION TARIFS (PRICING) */}
                            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><CreditCard className="w-6 h-6 text-[#b48a4d]" /> 4. Section Tarification</h2>
                                    <button disabled={saving} onClick={() => handleSaveContent('pricing')} className="px-8 py-3 bg-[#b48a4d] text-white rounded-full text-[10px] font-black uppercase">Publier Tarifs</button>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {[0, 1, 2].map((idx) => {
                                        const plan = siteContent.pricing?.plans?.[idx] || { t: "", p: "", f: [] };
                                        return (
                                            <div key={idx} className="p-8 bg-zinc-50 rounded-[3rem] border border-zinc-100 space-y-4">
                                                <Input label="Nom du Forfait" value={plan.t} onChange={(v) => {
                                                    const plans = [...(siteContent.pricing?.plans || [])];
                                                    plans[idx] = { ...plan, t: v };
                                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                                }} />
                                                <Input label="Prix (ex: 15.000 FCFA)" value={plan.p} onChange={(v) => {
                                                    const plans = [...(siteContent.pricing?.plans || [])];
                                                    plans[idx] = { ...plan, p: v };
                                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                                }} />
                                                <Textarea label="Fonctionnalités (1 par ligne)" value={plan.f?.join('\n')} onChange={(v) => {
                                                    const plans = [...(siteContent.pricing?.plans || [])];
                                                    plans[idx] = { ...plan, f: v.split('\n') };
                                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                                }} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* SHOPS LIST */}
                    {activeTab === 'shops' && (
                        <motion.div key="shops" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-black/5">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Boutique</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {filteredShops.map((shop: any) => (
                                        <tr key={shop.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="px-8 py-6 font-bold">{shop.name}</td>
                                            <td className="px-8 py-6 text-right"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${shop.is_master ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-zinc-100 text-zinc-400'}`}>{shop.is_master ? 'Master' : 'Shop'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function KpiCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 space-y-4 shadow-sm">
            <div className={`w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p><p className="text-3xl font-serif font-bold text-zinc-900">{value ?? '...'}</p></div>
        </div>
    )
}

function Input({ label, value, onChange }: { label: string, value: any, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-[0.1em]">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 ring-[#064e3b]/5 transition-all" />
        </div>
    )
}

function Textarea({ label, value, onChange }: { label: string, value: any, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-[0.1em]">{label}</label>
            <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 ring-[#064e3b]/5 transition-all" />
        </div>
    )
}
