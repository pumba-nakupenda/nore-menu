'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings'
import { Save, RefreshCw, Globe, MessageSquare, Smartphone, Loader2 } from 'lucide-react'

import OpeningHoursEditor from '@/components/admin/settings/OpeningHoursEditor'
import PaymentConfig from '@/components/admin/settings/PaymentConfig'
import BrandingPanel from '@/components/admin/settings/BrandingPanel'
import WiFiForm from '@/components/admin/settings/WiFiForm'
import SocialLinksForm from '@/components/admin/settings/SocialLinksForm'

export default function SettingsPage() {
    const { restaurantId, restaurant: authRestaurant, token, refreshRestaurant } = useAuth()
    const router = useRouter()
    const s = useRestaurantSettings({ restaurantId, authRestaurant, token, refreshRestaurant })

    if (s.loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            <p className="font-medium animate-pulse">Chargement des réglages...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="mb-8">
                <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Réglages Restaurant</h2>
                <p className="text-zinc-500 mt-2 text-lg">Gérez vos informations et l'apparence de votre menu public.</p>
            </div>

            <form onSubmit={s.handleSave} className="space-y-8">
                {/* RESTAURANT INFO */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Globe className="w-5 h-5 mr-3 text-gold" />
                        <h3>Informations Générales</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Nom de l'établissement</label>
                            <input type="text" value={s.restaurantName} onChange={(e) => s.setRestaurantName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-zinc-900 font-bold shadow-sm" required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">À propos (FR)</label>
                                <textarea value={s.about} onChange={(e) => s.setAbout(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-medium min-h-[100px] shadow-sm" placeholder="L'histoire de votre restaurant..." />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">À propos (EN)</label>
                                <textarea value={s.aboutEn} onChange={(e) => s.setAboutEn(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-medium min-h-[100px] shadow-sm" placeholder="Your restaurant's story..." />
                            </div>
                        </div>
                    </div>
                </div>

                <PaymentConfig currency={s.currency} setCurrency={s.setCurrency} taxRate={s.taxRate} setTaxRate={s.setTaxRate} isTaxIncluded={s.isTaxIncluded} setIsTaxIncluded={s.setIsTaxIncluded} paymentLogic={s.paymentLogic} setPaymentLogic={s.setPaymentLogic} />

                {/* CONTACT METHODS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                        <MessageSquare className="w-5 h-5 mr-3 text-emerald-600" />
                        <h3>Méthodes de Contact</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            {(['whatsapp', 'call', 'both'] as const).map((method) => (
                                <button key={method} type="button" onClick={() => s.setContactMethod(method)} className={`p-4 rounded-2xl border-2 transition-all text-center ${s.contactMethod === method ? (method === 'whatsapp' ? 'border-emerald-600 bg-emerald-50' : method === 'call' ? 'border-blue-600 bg-blue-50' : 'border-purple-600 bg-purple-50') : 'border-zinc-200 bg-zinc-50'}`}>
                                    {method === 'both' ? (
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <MessageSquare className={`w-5 h-5 ${s.contactMethod === 'both' ? 'text-purple-600' : 'text-zinc-400'}`} />
                                            <Smartphone className={`w-5 h-5 ${s.contactMethod === 'both' ? 'text-purple-600' : 'text-zinc-400'}`} />
                                        </div>
                                    ) : method === 'whatsapp' ? (
                                        <MessageSquare className={`w-6 h-6 mx-auto mb-2 ${s.contactMethod === 'whatsapp' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                                    ) : (
                                        <Smartphone className={`w-6 h-6 mx-auto mb-2 ${s.contactMethod === 'call' ? 'text-blue-600' : 'text-zinc-400'}`} />
                                    )}
                                    <p className="text-xs font-bold">{method === 'whatsapp' ? 'WhatsApp' : method === 'call' ? 'Appel' : 'Les deux'}</p>
                                </button>
                            ))}
                        </div>
                        {(s.contactMethod === 'whatsapp' || s.contactMethod === 'both') && (
                            <input type="text" placeholder="Numéro WhatsApp (+221...)" value={s.whatsappNumber} onChange={(e) => s.setWhatsappNumber(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white outline-none text-zinc-900 font-bold" />
                        )}
                        {(s.contactMethod === 'call' || s.contactMethod === 'both') && (
                            <input type="text" placeholder="Numéro de Téléphone" value={s.phoneNumber} onChange={(e) => s.setPhoneNumber(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white outline-none text-zinc-900 font-bold" />
                        )}
                    </div>
                </div>

                <BrandingPanel theme={s.theme} setTheme={s.setTheme} primaryColor={s.primaryColor} setPrimaryColor={s.setPrimaryColor} fontFamily={s.fontFamily} setFontFamily={s.setFontFamily} headerStyle={s.headerStyle} setHeaderStyle={s.setHeaderStyle} isLogoEnabled={s.isLogoEnabled} setIsLogoEnabled={s.setIsLogoEnabled} logoUrl={s.logoUrl} setLogoUrl={s.setLogoUrl} uploadingLogo={s.uploadingLogo} handleUploadLogo={s.handleUploadLogo} />

                <OpeningHoursEditor openingHours={s.openingHours} setOpeningHours={s.setOpeningHours} />

                <WiFiForm wifiSsid={s.wifiSsid} setWifiSsid={s.setWifiSsid} wifiPassword={s.wifiPassword} setWifiPassword={s.setWifiPassword} wifiSecurity={s.wifiSecurity} setWifiSecurity={s.setWifiSecurity} isWifiEnabled={s.isWifiEnabled} setIsWifiEnabled={s.setIsWifiEnabled} />

                <SocialLinksForm isSocialEnabled={s.isSocialEnabled} setIsSocialEnabled={s.setIsSocialEnabled} instagramUrl={s.instagramUrl} setInstagramUrl={s.setInstagramUrl} isInstagramEnabled={s.isInstagramEnabled} setIsInstagramEnabled={s.setIsInstagramEnabled} facebookUrl={s.facebookUrl} setFacebookUrl={s.setFacebookUrl} isFacebookEnabled={s.isFacebookEnabled} setIsFacebookEnabled={s.setIsFacebookEnabled} tiktokUrl={s.tiktokUrl} setTiktokUrl={s.setTiktokUrl} isTiktokEnabled={s.isTiktokEnabled} setIsTiktokEnabled={s.setIsTiktokEnabled} youtubeUrl={s.youtubeUrl} setYoutubeUrl={s.setYoutubeUrl} isYoutubeEnabled={s.isYoutubeEnabled} setIsYoutubeEnabled={s.setIsYoutubeEnabled} websiteUrl={s.websiteUrl} setWebsiteUrl={s.setWebsiteUrl} isWebsiteEnabled={s.isWebsiteEnabled} setIsWebsiteEnabled={s.setIsWebsiteEnabled} address={s.address} setAddress={s.setAddress} googleMapsUrl={s.googleMapsUrl} setGoogleMapsUrl={s.setGoogleMapsUrl} isLocationEnabled={s.isLocationEnabled} setIsLocationEnabled={s.setIsLocationEnabled} />

                {/* STICKY SAVE BAR */}
                <div className="sticky bottom-8 left-0 right-0 z-20 flex items-center justify-end gap-6 p-6 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-black/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] mt-10">
                    <button type="button" onClick={() => router.back()} className="px-8 py-4 rounded-2xl font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all text-sm">
                        Annuler
                    </button>
                    <button type="submit" disabled={s.saving} className="bg-brand text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-emerald-900/20 flex items-center disabled:opacity-50 hover:-translate-y-1 active:translate-y-0 text-sm">
                        {s.saving ? <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                        {s.saving ? 'Sauvegarde...' : 'Enregistrer tous les réglages'}
                    </button>
                </div>
            </form>
        </div>
    )
}
