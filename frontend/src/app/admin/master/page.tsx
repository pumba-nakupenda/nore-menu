'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AnimatePresence } from 'framer-motion'
import { RefreshCw, BarChart3, Store, ShoppingBag, Layout, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import AnalyticsTab from '@/components/admin/master/AnalyticsTab'
import ShopsTab from '@/components/admin/master/ShopsTab'
import HardwareTab from '@/components/admin/master/HardwareTab'
import ContentEditor from '@/components/admin/master/ContentEditor'

export default function MasterAdmin() {
    const [loading, setLoading] = useState(true)
    const [saving, setSave] = useState(false)
    const [activeTab, setActiveTab] = useState<'analytics' | 'shops' | 'hardware' | 'content'>('analytics')
    const [stats, setStats] = useState<any>(null)
    const [searchTerm, setSearchSearchTerm] = useState('')
    const [hardwareItems, setHardwareItems] = useState<any[]>([])
    const [uploadingIdx, setUploadingIdx] = useState<string | number | null>(null)
    const [siteContent, setSiteContent] = useState<any>({
        hero: { title: "Digitalisez\nL'Excellence", subtitle: "Système complet de Commande WhatsApp & POS pour les restaurants premium.", image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" },
        solution: { title: "Un écosystème\nsans failles.", description: "Nore Menu résout la lenteur du service et les erreurs de commande.", image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" },
        flow: { title: "Le Flux", steps: [] },
        pricing: { title: "L'Investissement", plans: [] }
    })

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/global-stats`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            setStats(await response.json())
            const { data: products } = await supabase.from('hardware_products').select('*').order('created_at', { ascending: false })
            if (products) setHardwareItems(products)
            const { data: contentData } = await supabase.from('site_content').select('*')
            if (contentData && contentData.length > 0) {
                const contentObj = contentData.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.value }), {})
                setSiteContent((prev: any) => ({ ...prev, ...contentObj }))
            }
        } catch (error) { toast.error("Erreur de synchronisation") } finally { setLoading(false) }
    }

    const toggleApproval = async (shopId: string, currentStatus: boolean) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/master/approve/${shopId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ is_approved: !currentStatus })
            })
            if (!response.ok) throw new Error("Erreur serveur")
            toast.success(currentStatus ? "Accès suspendu" : "Établissement validé !")
            fetchData()
        } catch (err) { toast.error("Erreur lors de la validation") }
    }

    const handleSaveContent = async (section: string) => {
        setSave(true)
        try {
            const { error } = await supabase.from('site_content').upsert({ key: section, value: siteContent[section] })
            if (error) throw error
            toast.success(`Section "${section}" mise à jour`)
        } catch (error) { toast.error("Erreur d'enregistrement") } finally { setSave(false) }
    }

    const handleHardwareSave = async (item: any) => {
        setSave(true)
        try {
            const { error } = await supabase.from('hardware_products').upsert({
                id: item.id.toString().includes('.') ? undefined : item.id,
                title: item.title, description: item.description, price: Number(item.price),
                image_url: item.image_url, tag: item.tag, is_active: item.is_active ?? true
            })
            if (error) throw error
            toast.success(`${item.title} enregistré`); fetchData()
        } catch (error) { toast.error("Erreur enregistrement") } finally { setSave(false) }
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avif`, { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}` }, body: formData })
            const data = await res.json()
            if (data.url) { callback(data.url); toast.success("Image optimisée") }
        } catch (error) { toast.error("Erreur upload") } finally { setUploadingIdx(null) }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><RefreshCw className="w-10 h-10 animate-spin text-brand" /></div>

    const conversionRate = stats ? (stats.totalWhatsAppOrders / stats.totalScans) * 100 : 0
    const tabs = [
        { id: 'analytics', label: 'Tracking', icon: BarChart3 },
        { id: 'shops', label: 'Boutiques', icon: Store },
        { id: 'hardware', label: 'Vrai Shop', icon: ShoppingBag },
        { id: 'content', label: 'Design Site', icon: Layout }
    ]

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-brand/10 pb-40">
            <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-black/5 pb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold flex items-center gap-3">Master Control <ShieldCheck className="w-6 h-6 text-[#b48a4d]" /></h1>
                        <p className="text-zinc-500 font-medium italic">Business Intelligence & Design Public</p>
                    </div>
                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-brand shadow-md' : 'text-zinc-400'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>
                <AnimatePresence mode="wait">
                    {activeTab === 'analytics' && <AnalyticsTab stats={stats} conversionRate={conversionRate} />}
                    {activeTab === 'shops' && <ShopsTab stats={stats} searchTerm={searchTerm} setSearchTerm={setSearchSearchTerm} toggleApproval={toggleApproval} />}
                    {activeTab === 'hardware' && <HardwareTab hardwareItems={hardwareItems} setHardwareItems={setHardwareItems} uploadingIdx={uploadingIdx} handleHardwareSave={handleHardwareSave} deleteHardware={deleteHardware} handleFileUpload={handleFileUpload} />}
                    {activeTab === 'content' && <ContentEditor saving={saving} siteContent={siteContent} setSiteContent={setSiteContent} uploadingIdx={uploadingIdx} handleSaveContent={handleSaveContent} handleFileUpload={handleFileUpload} />}
                </AnimatePresence>
            </div>
        </div>
    )
}
