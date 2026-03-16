'use client'

import { Wifi, MapPin, Clock, Star } from 'lucide-react'

interface HoursModalProps {
    restaurant: any
    isDark: boolean
    onClose: () => void
}

export function HoursModal({ restaurant, isDark, onClose }: HoursModalProps) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><Clock className="w-10 h-10 text-gold" /></div>
                <h3 className="text-2xl font-black uppercase mb-6">Nos Horaires</h3>
                <div className="space-y-3 mb-8">
                    {(restaurant?.opening_hours || []).map((h: any) => (
                        <div key={h.day} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                            <span className="text-xs font-bold text-zinc-400">{h.day}</span>
                            <span className={`text-xs font-black ${h.isOpen ? 'text-emerald-500' : 'text-red-400'}`}>{h.isOpen ? h.hours : 'Ferme'}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full py-4 bg-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs">Fermer</button>
            </div>
        </div>
    )
}

interface WifiModalProps {
    restaurant: any
    isDark: boolean
    onClose: () => void
}

export function WifiModal({ restaurant, isDark, onClose }: WifiModalProps) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><Wifi className="w-10 h-10 text-emerald-500" /></div>
                <h3 className="text-2xl font-black uppercase mb-2">WiFi Gratuit</h3>
                <div className="space-y-4 text-left my-8">
                    <div className="p-4 bg-zinc-50 rounded-2xl border"><p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Reseau</p><p className="font-bold text-zinc-900">{restaurant?.wifi_ssid}</p></div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border"><p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Mot de passe</p><p className="font-bold text-zinc-900">{restaurant?.wifi_password}</p></div>
                </div>
                <button onClick={onClose} className="w-full py-4 bg-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs">OK</button>
            </div>
        </div>
    )
}

interface FeedbackModalProps {
    isDark: boolean
    feedbackRating: number
    setFeedbackRating: (rating: number) => void
    feedbackComment: string
    setFeedbackComment: (comment: string) => void
    isSubmittingFeedback: boolean
    submitFeedback: () => void
    onClose: () => void
}

export function FeedbackModal({ isDark, feedbackRating, setFeedbackRating, feedbackComment, setFeedbackComment, isSubmittingFeedback, submitFeedback, onClose }: FeedbackModalProps) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                <h3 className="text-2xl font-black uppercase mb-2">Votre avis</h3>
                <p className="text-zinc-400 text-xs mb-8">Aidez-nous a nous ameliorer.</p>
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setFeedbackRating(s)} className={`text-2xl transition-all ${feedbackRating >= s ? 'text-amber-500 scale-110' : 'text-zinc-200'}`}>
                            <Star className={`w-8 h-8 ${feedbackRating >= s ? 'fill-current' : ''}`} />
                        </button>
                    ))}
                </div>
                <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Commentaire..." className="w-full p-4 bg-zinc-50 rounded-2xl mb-8 text-sm min-h-[100px] outline-none border border-zinc-100 focus:border-gold" />
                <button onClick={submitFeedback} disabled={isSubmittingFeedback} className="w-full py-4 bg-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">{isSubmittingFeedback ? 'Envoi...' : 'Envoyer'}</button>
            </div>
        </div>
    )
}

interface LocationModalProps {
    restaurant: any
    isDark: boolean
    onClose: () => void
}

export function LocationModal({ restaurant, isDark, onClose }: LocationModalProps) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative rounded-[3rem] w-full max-w-sm p-10 text-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6"><MapPin className="w-10 h-10 text-gold" /></div>
                <h3 className="text-2xl font-black uppercase mb-2">Localisation</h3>
                <p className="text-zinc-400 text-sm mb-8">{restaurant?.address}</p>
                {restaurant?.google_maps_url && <a href={restaurant.google_maps_url} target="_blank" className="block w-full py-4 bg-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs mb-3 shadow-lg">Ouvrir Google Maps</a>}
                <button onClick={onClose} className="w-full py-4 bg-zinc-100 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-xs">Fermer</button>
            </div>
        </div>
    )
}
