'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChefHat, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin/menu`
            }
        })
        if (error) setMessage(error.message)
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) setMessage(error.message)
            else setMessage('Check your email!')
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setMessage(error.message)
            } else {
                // Force refresh to clear any router cache
                router.push('/admin/menu')
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen bg-[#fdfcfb]">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 bg-[#fdfcfb]">
                <div className="absolute top-8 left-8">
                    <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-[#064e3b] transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#064e3b] text-white rounded-2xl shadow-xl shadow-emerald-900/20 mb-2">
                            <ChefHat className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">
                            {isSignUp ? 'Join Nore Menu' : 'Welcome Back'}
                        </h2>
                        <p className="text-zinc-500 max-w-xs mx-auto">
                            {isSignUp ? 'Create your premium digital menu experience in minutes.' : 'Sign in to manage your restaurant and delight your guests.'}
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('Check') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={signInWithGoogle}
                            className="w-full flex justify-center items-center gap-3 py-4 px-4 bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.22 3.28-7.42 3.28-12.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-100"></div>
                            </div>
                            <span className="relative px-4 bg-[#fdfcfb] text-[10px] font-black uppercase tracking-widest text-zinc-400">or use email</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#064e3b] transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/5 focus:border-[#064e3b] transition shadow-sm"
                                    placeholder="restaurateur@nore.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#064e3b] transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/5 focus:border-[#064e3b] transition shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 bg-[#064e3b] text-white rounded-2xl shadow-xl shadow-emerald-900/20 text-lg font-bold hover:bg-[#053e2f] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
                            className="text-sm font-semibold text-[#c5a059] hover:text-[#b59049] transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one now"}
                        </button>
                    </div>
                </div>
                
                <footer className="mt-20 text-zinc-400 text-xs">
                    &copy; {new Date().getFullYear()} Nore Menu. All rights reserved.
                </footer>
            </div>

            {/* Right side - Visual Content */}
            <div className="hidden lg:flex flex-1 bg-[#053e2f] relative overflow-hidden items-center justify-center">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#c5a059] rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-10"></div>

                <div className="max-w-md text-center space-y-8 z-10 px-12">
                    <div className="relative inline-block">
                         <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150"></div>
                         <img 
                            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop" 
                            alt="Luxury cocktail" 
                            className="relative w-64 h-64 object-cover rounded-[3rem] shadow-2xl border-4 border-white/10"
                         />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-serif font-bold text-white leading-tight">
                            Elevate your <span className="italic text-[#c5a059]">guest experience</span>.
                        </h3>
                        <p className="text-zinc-300 text-lg leading-relaxed">
                            "The menu is the heart of the restaurant. We make it beat digitally."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}