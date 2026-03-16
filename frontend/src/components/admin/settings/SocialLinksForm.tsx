'use client'

import { Globe, Instagram, Facebook, Music, Youtube, MapPin } from 'lucide-react'

interface SocialLinksFormProps {
    isSocialEnabled: boolean
    setIsSocialEnabled: (v: boolean) => void
    instagramUrl: string
    setInstagramUrl: (v: string) => void
    isInstagramEnabled: boolean
    setIsInstagramEnabled: (v: boolean) => void
    facebookUrl: string
    setFacebookUrl: (v: string) => void
    isFacebookEnabled: boolean
    setIsFacebookEnabled: (v: boolean) => void
    tiktokUrl: string
    setTiktokUrl: (v: string) => void
    isTiktokEnabled: boolean
    setIsTiktokEnabled: (v: boolean) => void
    youtubeUrl: string
    setYoutubeUrl: (v: string) => void
    isYoutubeEnabled: boolean
    setIsYoutubeEnabled: (v: boolean) => void
    websiteUrl: string
    setWebsiteUrl: (v: string) => void
    isWebsiteEnabled: boolean
    setIsWebsiteEnabled: (v: boolean) => void
    address: string
    setAddress: (v: string) => void
    googleMapsUrl: string
    setGoogleMapsUrl: (v: string) => void
    isLocationEnabled: boolean
    setIsLocationEnabled: (v: boolean) => void
}

export default function SocialLinksForm({
    isSocialEnabled, setIsSocialEnabled,
    instagramUrl, setInstagramUrl,
    isInstagramEnabled, setIsInstagramEnabled,
    facebookUrl, setFacebookUrl,
    isFacebookEnabled, setIsFacebookEnabled,
    tiktokUrl, setTiktokUrl,
    isTiktokEnabled, setIsTiktokEnabled,
    youtubeUrl, setYoutubeUrl,
    isYoutubeEnabled, setIsYoutubeEnabled,
    websiteUrl, setWebsiteUrl,
    isWebsiteEnabled, setIsWebsiteEnabled,
    address, setAddress,
    googleMapsUrl, setGoogleMapsUrl,
    isLocationEnabled, setIsLocationEnabled,
}: SocialLinksFormProps) {
    return (
        <>
            {/* SOCIAL MEDIA & LINKS */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Globe className="w-5 h-5 mr-3 text-emerald-600" />
                        <h3>Reseaux Sociaux & Web</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsSocialEnabled(!isSocialEnabled)}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isSocialEnabled ? 'border-brand bg-brand text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{isSocialEnabled ? 'Active' : 'Desactive'}</span>
                        <div className={`w-8 h-4 rounded-full relative transition-all ${isSocialEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                            <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isSocialEnabled ? 'right-1' : 'left-1'}`} />
                        </div>
                    </button>
                </div>

                <div className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${isSocialEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                    {/* Instagram */}
                    <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100 shadow-sm">
                                    <Instagram className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Instagram</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsInstagramEnabled(!isInstagramEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-all ${isInstagramEnabled ? 'bg-pink-500' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isInstagramEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            disabled={!isInstagramEnabled}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-pink-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        />
                    </div>

                    {/* Facebook */}
                    <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                    <Facebook className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Facebook</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFacebookEnabled(!isFacebookEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-all ${isFacebookEnabled ? 'bg-blue-600' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isFacebookEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            disabled={!isFacebookEnabled}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-blue-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        />
                    </div>

                    {/* TikTok */}
                    <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
                                    <Music className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">TikTok</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTiktokEnabled(!isTiktokEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-all ${isTiktokEnabled ? 'bg-black' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isTiktokEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={tiktokUrl}
                            onChange={(e) => setTiktokUrl(e.target.value)}
                            disabled={!isTiktokEnabled}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-zinc-400 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        />
                    </div>

                    {/* YouTube */}
                    <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                                    <Youtube className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">YouTube</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsYoutubeEnabled(!isYoutubeEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-all ${isYoutubeEnabled ? 'bg-red-600' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isYoutubeEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            disabled={!isYoutubeEnabled}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-red-300 outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        />
                    </div>

                    {/* Website */}
                    <div className="p-6 rounded-[2rem] border border-black/5 bg-zinc-50/50 md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-brand border border-emerald-100 shadow-sm">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Site Web Officiel</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsWebsiteEnabled(!isWebsiteEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-all ${isWebsiteEnabled ? 'bg-brand' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isWebsiteEnabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            disabled={!isWebsiteEnabled}
                            className="w-full px-5 py-3.5 rounded-xl bg-white border border-black/5 focus:border-brand outline-none text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* LOCATION & ADDRESS */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <MapPin className="w-5 h-5 mr-3 text-emerald-600" />
                        <h3>Localisation & Adresse</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsLocationEnabled(!isLocationEnabled)}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isLocationEnabled ? 'border-brand bg-brand text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{isLocationEnabled ? 'Active' : 'Desactive'}</span>
                        <div className={`w-8 h-4 rounded-full relative transition-all ${isLocationEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                            <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isLocationEnabled ? 'right-1' : 'left-1'}`} />
                        </div>
                    </button>
                </div>

                <div className={`grid gap-6 transition-all duration-300 ${isLocationEnabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none grayscale translate-y-2'}`}>
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Adresse Physique</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-5 pr-12 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand focus:ring-4 focus:ring-emerald-50 outline-none text-zinc-900 font-bold transition-all shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Lien Google Maps</label>
                        <input
                            type="text"
                            value={googleMapsUrl}
                            onChange={(e) => setGoogleMapsUrl(e.target.value)}
                            className="w-full pl-5 pr-12 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand focus:ring-4 focus:ring-emerald-50 outline-none text-zinc-900 font-bold transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
