'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Lock, Mail, Shield, AlertTriangle, Loader2, Save, RefreshCw, LogOut, Trash2 } from 'lucide-react'

export default function AccountPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()

    // Form states
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setNewConfirmPassword] = useState('')

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            setNewEmail(user.email || '')
            setLoading(false)
        }
        getProfile()
    }, [router])

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        const { error } = await supabase.auth.updateUser({ email: newEmail })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Vérifiez votre nouvel email pour le lien de confirmation !")
        }
        setUpdating(false)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas")
            return
        }
        setUpdating(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Mot de passe mis à jour avec succès !")
            setNewPassword('')
            setNewConfirmPassword('')
        }
        setUpdating(false)
    }

    const handleDeleteAccount = async () => {
        const confirmed = confirm("⚠️ DANGER : Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est permanente et supprimera votre restaurant et tous vos plats.")
        if (!confirmed) return

        toast.error("La suppression de compte nécessite un contact administratif pour des raisons de sécurité.")
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
            <p className="font-medium animate-pulse">Chargement du profil...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div>
                <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Gestion du Compte</h2>
                <p className="text-zinc-500 mt-2 text-lg">Sécurisez votre accès et gérez votre profil administrateur.</p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-[#064e3b] p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10"></div>
                        <div className="w-20 h-20 bg-[#c5a059] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white/10">
                            <User className="w-10 h-10 text-[#064e3b]" />
                        </div>
                        <h3 className="font-bold text-lg truncate px-2">{user.email?.split('@')[0]}</h3>
                        <p className="text-emerald-100/60 text-xs uppercase tracking-widest font-black mt-1">Membre Premium</p>
                        
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
                            <p className="text-[10px] text-emerald-100/40 uppercase font-bold tracking-tighter">Dernière connexion</p>
                            <p className="text-xs font-medium">{new Date(user.last_sign_in_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                        className="w-full py-4 rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Se déconnecter partout
                    </button>
                </div>

                {/* Forms Area */}
                <div className="md:col-span-8 space-y-8">
                    {/* Security Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Shield className="w-5 h-5 text-[#c5a059]" />
                            <h3>Connexion & Sécurité</h3>
                        </div>

                        {/* Email Update */}
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Adresse Email</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                        <input 
                                            type="email" 
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold transition-all shadow-inner"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={updating || newEmail === user.email}
                                        className="px-6 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-all disabled:opacity-30 shadow-lg"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="h-px bg-black/5 w-full"></div>

                        {/* Password Change */}
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nouveau Mot de Passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirmer le Mot de Passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setNewConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={updating || !newPassword}
                                className="w-full py-4 rounded-xl bg-[#064e3b] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-[#053e2f] transition-all flex items-center justify-center gap-2"
                            >
                                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                Mettre à jour les identifiants
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 space-y-6">
                        <div className="flex items-center gap-3 text-red-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h3>Zone de Danger</h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-red-900">Supprimer le Compte</p>
                                <p className="text-xs text-red-700/60 mt-1">Supprime définitivement votre restaurant et ses données.</p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                className="px-6 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Supprimer Définitivement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}