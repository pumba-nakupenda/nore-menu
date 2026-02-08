'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { UtensilsCrossed, QrCode, LogOut, Settings, ChefHat, User, BarChart3, MessageCircle, ShieldCheck, Menu, X, MessageSquare, ShoppingBag, Globe } from 'lucide-react'
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

    useEffect(() => {
        // Close sidebar and preview on navigation
        setIsSidebarOpen(false)
        setIsPreviewOpen(false)
    }, [pathname])

    const [isLoadingSession, setIsLoadingSession] = useState(true)

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

    if (isLoadingSession) return (
        <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center">
            <ChefHat className="w-10 h-10 animate-bounce text-[#064e3b]" />
        </div>
    )

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const isActive = (path: string) => pathname === path

    const navItems = [
        { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed },
        { name: 'Tableau de Bord', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Guest Feedback', href: '/admin/feedback', icon: MessageSquare },
        { name: 'QR Code', href: '/admin/qr', icon: QrCode },
        { name: 'Staff & POS', href: '/admin/staff', icon: User },
        { name: 'Account', href: '/admin/account', icon: User },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]

    // Only add Master link if user is master
    const filteredNavItems = isMaster 
        ? [{ name: 'Master Control', href: '/admin/master', icon: ShieldCheck }, ...navItems]
        : navItems

    return (
        <div className="min-h-screen bg-[#fdfcfb] flex font-sans selection:bg-[#064e3b]/10 selection:text-[#064e3b]">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[#053e2f] shadow-2xl flex flex-col text-white z-50 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto no-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 pb-10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#c5a059] text-[#064e3b] p-2 rounded-xl shadow-lg">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold tracking-tight text-white">Nore Menu</h1>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <p className="text-[10px] text-emerald-100/60 uppercase tracking-[0.2em] font-bold">Admin Console</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${active
                                    ? 'bg-[#c5a059] text-[#064e3b] shadow-lg shadow-black/20 font-bold scale-[1.02]'
                                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                                <span className="text-sm tracking-wide">{item.name}</span>
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#064e3b]"></div>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#c5a059]/20 flex items-center justify-center border border-[#c5a059]/30">
                                <User className="w-5 h-5 text-[#c5a059]" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">Administrator</p>
                                <p className="text-[10px] text-emerald-100/40 truncate">Manage restaurant</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => window.open('/#shop', '_self')}
                        className="flex items-center w-full px-5 py-3.5 mb-2 text-emerald-100/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all group border border-transparent hover:border-emerald-500/20"
                    >
                        <ShoppingBag className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <span className="text-sm font-bold">Shop Hardware</span>
                    </button>
                    <button
                        onClick={() => window.open('https://wa.me/221772354747', '_blank')}
                        className="flex items-center w-full px-5 py-3.5 mb-2 text-emerald-100/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all group border border-transparent hover:border-emerald-500/20"
                    >
                        <MessageCircle className="w-5 h-5 mr-3 text-[#c5a059]" />
                        <span className="text-sm font-bold">WhatsApp Support</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-5 py-3.5 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-2xl transition-all group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:translate-x-1" />
                        <span className="text-sm font-bold">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                <header className="sticky top-0 z-30 bg-[#fdfcfb]/80 backdrop-blur-md border-b border-black/5 px-4 md:px-8 py-4 flex justify-between items-center lg:justify-end">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2.5 bg-white border border-black/5 rounded-xl text-zinc-500 hover:text-[#064e3b] shadow-sm transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#064e3b] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
                        >
                            <Globe className="w-3 h-3" />
                            <span className="hidden xs:block">Aperçu Menu</span>
                        </button>
                        <div className="h-8 w-[1px] bg-black/5 mx-1 hidden sm:block"></div>
                        <button className="p-2.5 bg-white border border-black/5 rounded-xl text-zinc-400 hover:text-[#064e3b] shadow-sm transition-colors relative">
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#c5a059] rounded-full border-2 border-white"></span>
                            <UtensilsCrossed className="w-4 h-4" />
                        </button>
                    </div>
                </header>
                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* MOBILE PREVIEW OVERLAY - Now Floating & Non-blocking */}
            {isPreviewOpen && (
                <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
                    {/* iPhone Mockup Container */}
                    <div className="relative w-[320px] h-[650px] bg-black rounded-[3rem] p-2 shadow-[0_20px_80px_rgba(0,0,0,0.3)] border-[6px] border-zinc-900 pointer-events-auto animate-in slide-in-from-bottom-10 duration-500 flex flex-col origin-bottom-right">
                        
                        {/* Dedicated Close Button */}
                        <button 
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute -top-4 -left-4 w-10 h-10 bg-white text-zinc-900 rounded-full flex items-center justify-center shadow-xl border border-zinc-100 hover:scale-110 active:scale-95 transition-all z-50 pointer-events-auto"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* iPhone Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-[1.2rem] z-20 flex items-center justify-center gap-2">
                            <div className="w-6 h-1 bg-zinc-800 rounded-full"></div>
                        </div>

                        {/* Iframe Content */}
                        <div className="flex-1 w-full bg-white rounded-[2.4rem] overflow-hidden relative">
                            <iframe 
                                src={`/menu/${restaurantId}?preview=true`} 
                                className="w-full h-full border-none"
                                title="iPhone Menu Preview"
                            />
                        </div>

                        {/* iPhone Home Indicator */}
                        <div className="h-4 flex items-center justify-center shrink-0">
                            <div className="w-20 h-1 bg-zinc-800 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}