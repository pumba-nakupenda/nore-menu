'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { UserPlus, Trash2, Key, Shield, User, Loader2, Smartphone, ShieldAlert, Edit2, Utensils, Coins, MessageCircle, Check, X, ArrowRight, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function StaffManagementPage() {
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [restaurantName, setRestaurantName] = useState<string>('')
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<any | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [perms, setPerms] = useState({
        whatsapp: true,
        cashier: true,
        kitchen: true
    })

    const copyPosLink = () => {
        const url = `${window.location.origin}/pos/login`
        navigator.clipboard.writeText(url)
        toast.success('Lien du POS copié !')
    }

    useEffect(() => {
        const fetchUserRestaurant = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: restaurant } = await supabase.from('restaurants').select('id, name').eq('owner_id', user.id).single()
            if (restaurant) {
                setRestaurantId(restaurant.id)
                setRestaurantName(restaurant.name || '')
                fetchStaff(restaurant.id)
            }
        }
        fetchUserRestaurant()
    }, [])

    const fetchStaff = async (resId: string) => {
        try {
            const session = await supabase.auth.getSession()
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${resId}`, {
                headers: { 'Authorization': `Bearer ${session.data.session?.access_token}` }
            })
            const data = await res.json()
            setStaff(data)
        } catch (err) { toast.error('Erreur chargement') } finally { setLoading(false) }
    }

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const session = await supabase.auth.getSession()
            const url = editingStaff 
                ? `${process.env.NEXT_PUBLIC_API_URL}/staff/${editingStaff.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/staff/${restaurantId}`
            
            // CLEAN USERNAME: remove any existing prefix if the user typed it by mistake
            const cleanUsername = username.includes('@') ? username.split('@')[1] : username;
            const prefix = restaurantName?.replace(/\s+/g, '').toLowerCase()
            const finalUsername = `${prefix}@${cleanUsername}`

            const res = await fetch(url, {
                method: editingStaff ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.data.session?.access_token}`
                },
                body: JSON.stringify({ 
                    displayName, 
                    username: finalUsername, 
                    password, 
                    can_view_whatsapp: perms.whatsapp,
                    can_view_cashier: perms.cashier,
                    can_view_kitchen: perms.kitchen
                })
            })

            if (!res.ok) throw new Error('Erreur sauvegarde')
            toast.success('Compte mis à jour !')
            setIsModalOpen(false)
            fetchStaff(restaurantId!)
        } catch (err: any) { toast.error(err.message) } finally { setSaving(false) }
    }

    const openEdit = (member: any) => {
        setEditingStaff(member)
        setDisplayName(member.display_name)
        
        // STRIP PREFIX FOR EDITING (so user only sees the identifiant part)
        const parts = member.username.split('@')
        setUsername(parts.length > 1 ? parts[1] : parts[0])
        
        setPassword(member.password)
        setPerms({
            whatsapp: member.can_view_whatsapp !== false,
            cashier: member.can_view_cashier !== false,
            kitchen: member.can_view_kitchen !== false
        })
        setIsModalOpen(true)
    }

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-300" /></div>

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-12">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Gestion Staff & POS</h1>
                    <p className="text-zinc-500 font-medium">Contrôlez les accès et partagez le lien de vente.</p>
                </div>
                <button onClick={() => { setEditingStaff(null); setDisplayName(''); setUsername(''); setPassword(''); setIsModalOpen(true); }} className="bg-[#064e3b] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all"><UserPlus className="w-4 h-4" /> Créer un accès</button>
            </header>

            {/* QUICK ACCESS POS LINKS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#064e3b] text-white p-8 rounded-[2.5rem] flex items-center justify-between group shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                        <div>
                            <h2 className="text-xl font-black italic">Terminal de Vente</h2>
                            <p className="text-xs text-emerald-100/60 font-medium tracking-wide">Interface POS pour vos tablettes et ordinateurs.</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => window.open('/pos/login', '_blank')}
                                className="px-5 py-2.5 bg-white text-[#064e3b] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
                            >
                                Ouvrir
                            </button>
                            <button 
                                onClick={copyPosLink}
                                className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all"
                            >
                                <Copy className="w-3 h-3" /> Copier le lien
                            </button>
                        </div>
                    </div>
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center -mr-4 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-10 h-10 text-white/20" />
                    </div>
                </div>
                
                <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-sm hover:shadow-xl transition-all" onClick={() => window.open('https://wa.me/221772354747', '_blank')}>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-zinc-900">Support Technique</h2>
                        <p className="text-xs text-zinc-400 font-medium tracking-wide">Besoin d'aide pour configurer vos accès ?</p>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(staff) && staff.map((member) => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm relative group transition-all hover:shadow-xl flex flex-col">
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => openEdit(member)} className="p-2 bg-amber-50 text-[#c5a059] rounded-xl hover:scale-110 transition-all"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={async () => { if(confirm('Supprimer?')) { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${member.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } }); fetchStaff(restaurantId!) } }} className="p-2 bg-red-50 text-red-500 rounded-xl hover:scale-110 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 mb-6 group-hover:bg-[#c5a059]/10 group-hover:text-[#c5a059] transition-all"><User className="w-8 h-8" /></div>
                        <h3 className="font-black text-xl mb-1 text-zinc-900">{member.display_name}</h3>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex flex-col group/copy relative">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identifiant</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-[#c5a059]">{member.username}</p>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(member.username); toast.success('Identifiant copié !') }}
                                        className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-all"
                                        title="Copier l'identifiant"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col group/copy relative">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mot de passe</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-zinc-900">••••••••</p>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(member.password); toast.success('Mot de passe copié !') }}
                                        className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-all"
                                        title="Copier le mot de passe"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-8">
                            {member.can_view_whatsapp && <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg" title="WhatsApp"><MessageCircle className="w-4 h-4" /></div>}
                            {member.can_view_cashier && <div className="p-2 bg-amber-50 text-amber-600 rounded-lg" title="Caisse"><Coins className="w-4 h-4" /></div>}
                            {member.can_view_kitchen && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Cuisine"><Utensils className="w-4 h-4" /></div>}
                        </div>

                        <button 
                            onClick={() => window.open('/pos/login', '_blank')}
                            className="mt-auto w-full py-4 bg-zinc-50 text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2 group"
                        >
                            Lancer le POS <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleCreateStaff} className="relative bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-pop-in">
                        <h2 className="text-2xl font-black mb-2 text-zinc-900">{editingStaff ? 'Modifier' : 'Nouvel Accès'}</h2>
                        <p className="text-zinc-400 text-sm font-medium mb-8">Définissez les accès de l'employé.</p>

                        <div className="space-y-4">
                            <input required type="text" placeholder="Nom d'affichage (ex: Jean)" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:bg-white focus:border-[#064e3b] font-bold transition-all text-zinc-900" />
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Identifiant unique</label>
                                <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden focus-within:bg-white focus-within:border-[#064e3b] transition-all">
                                    <div className="px-4 py-4 bg-zinc-100 text-zinc-400 font-bold text-xs border-r border-zinc-200 shrink-0">
                                        {restaurantName?.replace(/\s+/g, '').toLowerCase()}@
                                    </div>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="identifiant" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)} 
                                        className="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-zinc-900" 
                                    />
                                </div>
                            </div>

                            <input required type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:bg-white focus:border-[#064e3b] font-bold transition-all text-zinc-900" />
                            
                            <div className="pt-4 space-y-3">
                                <p className="text-[10px] font-black uppercase text-zinc-400 ml-1">Visibilité des onglets POS</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setPerms({...perms, whatsapp: !perms.whatsapp})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${perms.whatsapp ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-zinc-100 text-zinc-300'}`}><MessageCircle className="w-5 h-5" /><span className="text-[8px] font-black uppercase">WhatsApp</span></button>
                                    <button type="button" onClick={() => setPerms({...perms, cashier: !perms.cashier})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${perms.cashier ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-zinc-100 text-zinc-300'}`}><Coins className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Caisse</span></button>
                                    <button type="button" onClick={() => setPerms({...perms, kitchen: !perms.kitchen})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${perms.kitchen ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-zinc-100 text-zinc-300'}`}><Utensils className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Cuisine</span></button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Annuler</button>
                            <button type="submit" disabled={saving} className="flex-[2] bg-[#064e3b] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-[#053e2f] transition-all disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Valider</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
