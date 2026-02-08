'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
    UtensilsCrossed, 
    QrCode, 
    LogOut, 
    Settings, 
    ChefHat, 
    User, 
    BarChart3, 
    MessageCircle, 
    ShieldCheck, 
    Menu, 
    X, 
    MessageSquare, 
    ShoppingBag, 
    Globe,
    LayoutDashboard
} from 'lucide-react'
import { Toaster } from 'sonner'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isMaster, setIsMaster] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [isLoadingSession, setIsLoadingSession] = useState(true)

    useEffect(() => {
        setIsSidebarOpen(false)
        setIsPreviewOpen(false)
    }, [pathname])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            } else {
                setIsLoadingSession(false)
                const { data: res } = await supabase.from('restaurants').select('id, is_master').eq('owner_id', session.user.id).single()
                setRestaurantId(res?.id || null)
                setIsMaster(res?.is_master || false)
            }
        }
        checkUser()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const isActive = (path: string) => pathname === path

    const navItems = [
        { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
        { name: 'QR Code', href: '/admin/qr', icon: QrCode },
        { name: 'Staff & POS', href: '/admin/staff', icon: User },
        { name: 'Compte', href: '/admin/account', icon: User },
        { name: 'Réglages', href: '/admin/settings', icon: Settings },
    ]

    const mobileBottomNav = [
        { name: 'Stats', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
        { name: 'QR', href: '/admin/qr', icon: QrCode },
        { name: 'Avis', href: '/admin/feedback', icon: MessageSquare },
    ]

    const filteredNavItems = isMaster 
        ? [{ name: 'Master Control', href: '/admin/master', icon: ShieldCheck }, ...navItems]
        : navItems

    if (isLoadingSession) return (
        <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center">
            <ChefHat className="w-10 h-10 animate-bounce text-[#064e3b]" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#fdfcfb] flex flex-col lg:flex-row font-sans selection:bg-[#064e3b]/10 selection:text-[#064e3b]">
            <Toaster position="top-center" richColors />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[#053e2f] shadow-2xl flex flex-col text-white z-[110] transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto no-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 pb-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#c5a059] text-[#064e3b] p-2 rounded-xl shadow-lg"><ChefHat className="w-6 h-6" /></div>
                            <h1 className="text-2xl font-serif font-bold tracking-tight text-white">Nore</h1>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link key={item.name} href={item.href} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-[#c5a059] text-[#064e3b] shadow-lg font-bold' : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'}`}>
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto space-y-2">
                    <button onClick={handleSignOut} className="flex items-center w-full px-5 py-3.5 text-red-300 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm">
                        <LogOut className="w-5 h-5 mr-3" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen relative pb-24 lg:pb-0">
                {/* Header (Always Visible) */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 md:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-zinc-50 rounded-xl text-zinc-900 border border-black/5 shadow-sm active:scale-95 transition-all">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="font-serif font-bold text-lg text-[#064e3b]">Nore</span>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#064e3b] rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm active:scale-95 transition-all">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="hidden xs:block text-xs">Preview</span>
                        </button>
                        <Link href="/admin/settings" className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 border border-black/5 hover:text-[#064e3b] transition-all">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                <main className="p-4 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                {/* MOBILE BOTTOM NAVIGATION (Native feel) */}
                <nav className="fixed bottom-0 left-0 right-0 z-[90] lg:hidden bg-white/90 backdrop-blur-2xl border-t border-black/5 px-6 py-3 pb-8 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    {mobileBottomNav.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group">
                                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-[#064e3b] text-white shadow-lg shadow-emerald-900/20 scale-110 -translate-y-1' : 'text-zinc-400 group-active:scale-90'}`}>
                                    <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : ''}`} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${active ? 'text-[#064e3b]' : 'text-zinc-400'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* PREVIEW MODAL (Preserved logic) */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[200] flex flex-col justify-end lg:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPreviewOpen(false)} />
                    <div className="relative w-full max-w-[380px] h-[85vh] lg:h-[800px] bg-black rounded-t-[3rem] lg:rounded-[3.5rem] p-3 shadow-2xl border-[8px] border-zinc-900 mx-auto animate-in slide-in-from-bottom-20 duration-500 flex flex-col">
                        <button onClick={() => setIsPreviewOpen(false)} className="absolute -top-12 left-1/2 -translate-x-1/2 text-white/60 hover:text-white flex flex-col items-center gap-1 font-bold text-[10px] uppercase tracking-widest transition-all">
                            <X className="w-6 h-6" /> Fermer
                        </button>
                        <div className="flex-1 w-full bg-white rounded-[2.2rem] overflow-hidden relative">
                            <iframe src={`/menu/${restaurantId}?preview=true`} className="w-full h-full border-none" />
                        </div>
                        <div className="h-6 flex items-center justify-center"><div className="w-24 h-1 bg-zinc-800 rounded-full" /></div>
                    </div>
                </div>
            )}
        </div>
    )
}
