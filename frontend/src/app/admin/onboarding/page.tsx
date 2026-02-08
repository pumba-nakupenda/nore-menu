'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Palette, Globe, Smartphone, ChevronRight, ChevronLeft, ChefHat, Sparkles, Loader2, Check } from 'lucide-react'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const router = useRouter()

    // Form Data
    const [name, setName] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [currency, setCurrency] = useState('FCFA')
    const [primaryColor, setPrimaryColor] = useState('#064e3b')
    const [logoUrl, setLogoUrl] = useState('')
    const [uploadingLogo, setUploadingLogo] = useState(false)

    useEffect(() => {
        checkRestaurant()
    }, [])

    const checkRestaurant = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (data) {
            router.push('/admin/menu')
        } else {
            setChecking(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingLogo(true)
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            setLogoUrl(publicUrl)
            toast.success('Logo uploaded!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUploadingLogo(false)
        }
    }

    const finishOnboarding = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/onboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    name, 
                    ownerId: user.id,
                    // These fields will be updated via settings after the base creation
                    // Or we could pass them all to the backend now.
                    // For simplicity and email trigger, we call onboard.
                })
            })

            if (!res.ok) throw new Error('Failed to create restaurant')

            const restaurant = await res.json()

            // Update with branding and contact details
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/settings/${restaurant.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    whatsapp_number: whatsapp,
                    currency,
                    primary_color: primaryColor,
                    logo_url: logoUrl,
                    theme: 'light',
                    font_family: 'font-serif'
                })
            })

            toast.success("Welcome to Nore Menu! Your space is ready.")
            router.push('/admin/menu')
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (checking) return (
        <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
            </div>

            <div className="w-full max-w-xl z-10">
                {/* Stepper Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#064e3b] text-white p-2.5 rounded-xl shadow-lg shadow-emerald-900/20">
                            <ChefHat className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-serif font-bold text-zinc-900">Nore Menu</h1>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Premium Onboarding</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-[#064e3b]' : 'w-2 bg-zinc-200'}`} />
                        ))}
                    </div>
                </div>

                {/* STEPS CONTENT */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 min-h-[450px] flex flex-col">
                    
                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-serif font-bold text-zinc-900 leading-tight">First, how should we <span className="italic text-[#c5a059]">call your place</span>?</h2>
                                <p className="text-zinc-500 text-sm">This name will be displayed on your digital menu and QR posters.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Le Petit Bistro"
                                        className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold shadow-inner transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Preferred Currency</label>
                                    <select 
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold shadow-inner"
                                    >
                                        <option value="FCFA">FCFA (XOF)</option>
                                        <option value="€">Euro (€)</option>
                                        <option value="$">Dollar ($)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BRANDING */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-serif font-bold text-zinc-900 leading-tight">Define your <span className="italic text-[#c5a059]">visual identity</span>.</h2>
                                <p className="text-zinc-500 text-sm">Let's make the digital menu truly yours with your logo and colors.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-8">
                                    <div className="relative group shrink-0">
                                        <div className="w-24 h-24 rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden relative">
                                            {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-zinc-300" />}
                                            {uploadingLogo && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" /></div>}
                                        </div>
                                        <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-zinc-900">Brand Logo</p>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-tighter">Recommended: Square PNG with transparent background.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Brand Signature Color</label>
                                    <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-[2rem] border border-black/5 shadow-inner">
                                        <input 
                                            type="color" 
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-sm overflow-hidden"
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-zinc-900">{primaryColor.toUpperCase()}</p>
                                            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">Applied to buttons and accents</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONTACT */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-serif font-bold text-zinc-900 leading-tight">Ready to <span className="italic text-[#c5a059]">receive orders</span>?</h2>
                                <p className="text-zinc-500 text-sm">Where should we send your customers' order requests?</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Smartphone className="w-3 h-3 text-emerald-500" /> WhatsApp Number
                                    </label>
                                    <input 
                                        type="text" 
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="Ex: +221 77 000 00 00"
                                        className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-zinc-900 font-bold shadow-inner transition-all"
                                    />
                                    <p className="text-[10px] text-zinc-400 italic">Include country code for seamless WhatsApp connection.</p>
                                </div>

                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-900">You're almost there!</p>
                                        <p className="text-[10px] text-emerald-700 leading-relaxed mt-1">Once you click finish, we'll generate your unique QR codes and you can start adding your delicious dishes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-black/5">
                        {step > 1 ? (
                            <button 
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-zinc-400 hover:text-zinc-900 font-bold transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button 
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && !name}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#064e3b] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/20 hover:bg-[#053e2f] transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                Next Step <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={finishOnboarding}
                                disabled={loading || !whatsapp}
                                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#c5a059] text-[#064e3b] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-900/10 hover:bg-[#b59049] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Launch My Menu
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center mt-8 text-zinc-400 text-xs">
                    &copy; {new Date().getFullYear()} Nore Menu Premium. All data secured by Supabase.
                </p>
            </div>
        </div>
    )
}