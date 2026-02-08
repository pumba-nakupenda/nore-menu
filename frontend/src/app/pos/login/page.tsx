'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Key, User, Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function POSLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) throw new Error('Identifiants POS incorrects')

            const staffData = await res.json()
            
            // Store session
            localStorage.setItem('nore_pos_session', JSON.stringify(staffData))
            
            toast.success(`Bienvenue, ${staffData.display_name} !`)
            router.push('/pos/dashboard')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#053e2f] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl animate-pop-in">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#c5a059] text-[#064e3b] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                        <ChefHat className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">Nore POS</h1>
                    <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Accès Employé</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Identifiant</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                            <input 
                                required
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="nom_restaurant@identifiant"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-[#c5a059] outline-none font-bold transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Mot de passe</label>
                        <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                            <input 
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-[#c5a059] outline-none font-bold transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#064e3b] text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                        Connexion
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-zinc-50 text-center">
                    <p className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Si vous avez oublié vos accès,<br/>contactez votre administrateur.
                    </p>
                </div>
            </div>
        </div>
    )
}
