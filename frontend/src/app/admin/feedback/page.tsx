'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, MessageSquare, Calendar, User, Loader2, ArrowUpRight, TrendingUp, Info } from 'lucide-react'

export default function FeedbackAdminPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return; }

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!restaurant) { router.push('/admin/onboarding'); return; }
            setRestaurantId(restaurant.id)
            loadFeedbacks(restaurant.id)
        }
        init()
    }, [router])

    const loadFeedbacks = async (id: string) => {
        setLoading(true)
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch feedbacks')
            const data = await res.json()
            setFeedbacks(data)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const averageRating = feedbacks.length > 0 
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0'

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
            <p className="font-medium animate-pulse">Reading guest feedback...</p>
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Guest <span className="text-[#064e3b] italic">Feedback</span></h2>
                    <p className="text-zinc-500 mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                        Listen to your customers to improve your service
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#064e3b] p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                            <Star className="w-6 h-6 text-[#c5a059] fill-current" />
                        </div>
                        <span className="text-[10px] font-black bg-[#c5a059] text-[#064e3b] px-2 py-1 rounded-full uppercase">Average</span>
                    </div>
                    <div className="text-5xl font-serif font-bold mb-2 tracking-tighter">{averageRating}</div>
                    <p className="text-emerald-100/60 text-xs font-black uppercase tracking-widest">Global Guest Satisfaction</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-zinc-50 rounded-2xl border border-black/5 text-[#064e3b]">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-5xl font-serif font-bold mb-2 tracking-tighter text-zinc-900">{feedbacks.length}</div>
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Total Reviews Received</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-xl font-bold text-zinc-900 mb-2 leading-tight">Response Rate</div>
                    <p className="text-zinc-400 text-sm font-medium">100% of guests can express themselves directly.</p>
                </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-zinc-900 px-2">Recent Reviews</h3>
                {feedbacks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10">
                        <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-400 font-medium">No reviews yet. Your feedback tool is active!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {feedbacks.map((f) => (
                            <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm flex flex-col md:flex-row gap-8 group hover:shadow-xl hover:shadow-black/5 transition-all">
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-[#c5a059] border border-black/5">
                                        <div className="text-2xl font-serif font-bold">{f.rating}</div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-2 h-2 ${f.rating >= s ? 'text-[#c5a059] fill-current' : 'text-zinc-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-zinc-900">Guest Review</span>
                                                {f.table_number && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-[#064e3b] text-[8px] font-black uppercase rounded-md border border-emerald-100">Table {f.table_number}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(f.created_at).toLocaleDateString()} at {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 leading-relaxed italic font-medium">
                                        "{f.comment || (f.rating >= 4 ? "Great experience!" : "No specific comment left.")}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
