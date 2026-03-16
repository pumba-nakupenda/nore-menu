'use client'

import Image from 'next/image'
import { Palette, Check, Upload, RefreshCw } from 'lucide-react'

interface BrandingPanelProps {
    theme: string
    setTheme: (v: string) => void
    primaryColor: string
    setPrimaryColor: (v: string) => void
    fontFamily: string
    setFontFamily: (v: string) => void
    headerStyle: string
    setHeaderStyle: (v: string) => void
    isLogoEnabled: boolean
    setIsLogoEnabled: (v: boolean) => void
    logoUrl: string
    setLogoUrl: (v: string) => void
    uploadingLogo: boolean
    handleUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function BrandingPanel({
    theme, setTheme,
    primaryColor, setPrimaryColor,
    fontFamily, setFontFamily,
    headerStyle, setHeaderStyle,
    isLogoEnabled, setIsLogoEnabled,
    logoUrl, setLogoUrl,
    uploadingLogo,
    handleUploadLogo,
}: BrandingPanelProps) {
    return (
        <>
            {/* THEME SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Palette className="w-5 h-5 mr-3 text-gold" />
                    <h3>Theme du Menu Public</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'light', name: 'Blanc Emeraude', desc: 'Clair & Epure', color: '#064e3b' },
                        { id: 'dark', name: 'Onyx Green', desc: 'Sombre & Luxueux', color: '#10b981' },
                        { id: 'neutral', name: 'Ivoire Chaud', desc: 'Doux & Chaleureux', color: '#c5a059' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTheme(t.id)}
                            className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${theme === t.id
                                ? 'border-brand bg-emerald-50/30'
                                : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${t.id === 'dark' ? 'bg-brand-dark' : 'bg-white'} border border-black/5 shadow-sm flex items-center justify-center`}>
                                    <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 text-[11px] uppercase tracking-wider italic">{t.name}</p>
                                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{t.desc}</p>
                                </div>
                            </div>
                            {theme === t.id && (
                                <div className="absolute top-4 right-4 bg-brand text-white p-1 rounded-full shadow-lg">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-10 pt-10 border-t border-black/5">
                    <div className="flex items-center mb-6">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-brand mr-3 border border-emerald-100">
                            <Palette className="w-4 h-4" />
                        </div>
                        <h4 className="font-black text-[10px] text-zinc-900 uppercase tracking-[0.2em]">Charte Graphique</h4>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="relative group shrink-0">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-24 h-24 rounded-[2rem] cursor-pointer border-4 border-white shadow-xl appearance-none bg-transparent overflow-hidden"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-zinc-700">Couleur Primaire</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={primaryColor.toUpperCase()}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-32 px-4 py-2.5 rounded-xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-zinc-600 font-mono text-xs font-bold shadow-sm"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['#064e3b', '#c5a059', '#10b981', '#f59e0b', '#ef4444', '#1e293b'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setPrimaryColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === color ? 'border-zinc-900 scale-110 shadow-lg' : 'border-white hover:scale-110 shadow-sm'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREMIUM CUSTOMIZATION SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Palette className="w-5 h-5 mr-3 text-gold" />
                    <h3>Personnalisation Premium</h3>
                </div>

                <div className="space-y-10">
                    <div>
                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 ml-1">Police d'ecriture (Font)</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'font-sans', name: 'Moderne', desc: 'Inter / Sans', sample: 'Aa' },
                                { id: 'font-serif', name: 'Luxe', desc: 'Playfair / Serif', sample: 'Aa' },
                                { id: 'font-classic', name: 'Classique', desc: 'Cormorant / Garamond', sample: 'Aa' },
                                { id: 'font-geometric', name: 'Geo', desc: 'Montserrat / Geometric', sample: 'Aa' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFontFamily(f.id)}
                                    className={`p-5 rounded-2xl border-2 transition-all text-center relative ${fontFamily === f.id ? 'border-brand bg-emerald-50/30 shadow-sm' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                                >
                                    <span className={`text-4xl block mb-2 ${f.id} text-brand`}>{f.sample}</span>
                                    <p className="font-black text-[10px] uppercase tracking-tight text-zinc-900">{f.name}</p>
                                    {fontFamily === f.id && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-brand text-white rounded-full"><Check className="w-3 h-3" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 ml-1">Style d'En-tete (Header)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'minimal', name: 'Minimal', color: 'bg-zinc-100' },
                                { id: 'glassmorphism', name: 'Glass', color: 'bg-emerald-100/30 backdrop-blur-md' },
                                { id: 'gradient', name: 'Degrade', color: 'bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-20' }
                            ].map(h => (
                                <button
                                    key={h.id}
                                    type="button"
                                    onClick={() => setHeaderStyle(h.id)}
                                    className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${headerStyle === h.id ? 'border-brand bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200 hover:bg-white'}`}
                                >
                                    <div className={`w-full h-10 rounded-xl mb-3 ${h.color} border border-black/5 shadow-inner`}></div>
                                    <p className="font-black text-[10px] uppercase text-center text-zinc-900 tracking-widest">{h.name}</p>
                                    {headerStyle === h.id && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-brand text-white rounded-full shadow-md"><Check className="w-3 h-3" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/5">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="font-black text-sm text-zinc-900 uppercase tracking-widest">Afficher le Logo</p>
                                <p className="text-xs text-zinc-400 font-medium mt-1">Affiche le logo du restaurant dans l'en-tete du menu.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLogoEnabled(!isLogoEnabled)}
                                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isLogoEnabled ? 'border-brand bg-brand text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{isLogoEnabled ? 'Active' : 'Desactive'}</span>
                                <div className={`w-8 h-4 rounded-full relative transition-all ${isLogoEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isLogoEnabled ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] bg-zinc-50/50 border border-black/5">
                            <div className="relative group shrink-0">
                                <div className={`w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center transition-all bg-white relative`}>
                                    {logoUrl ? (
                                        <Image src={logoUrl} alt="Apercu Logo" fill className="object-cover" />
                                    ) : (
                                        <Upload className="w-10 h-10 text-zinc-200" />
                                    )}
                                    {uploadingLogo && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <label className="block text-sm font-bold text-zinc-900">Logo du Restaurant</label>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        onChange={handleUploadLogo}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="px-6 py-3 bg-white border border-black/5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <Upload className="w-4 h-4 text-gold" />
                                        {logoUrl ? 'Changer le Logo' : 'Uploader un Logo'}
                                    </label>
                                    {logoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setLogoUrl('')}
                                            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
