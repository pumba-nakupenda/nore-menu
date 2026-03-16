'use client'

import { Wifi } from 'lucide-react'

interface WiFiFormProps {
    wifiSsid: string
    setWifiSsid: (v: string) => void
    wifiPassword: string
    setWifiPassword: (v: string) => void
    wifiSecurity: string
    setWifiSecurity: (v: string) => void
    isWifiEnabled: boolean
    setIsWifiEnabled: (v: boolean) => void
}

export default function WiFiForm({
    wifiSsid, setWifiSsid,
    wifiPassword, setWifiPassword,
    wifiSecurity, setWifiSecurity,
    isWifiEnabled, setIsWifiEnabled,
}: WiFiFormProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Wifi className="w-5 h-5 mr-3 text-emerald-600" />
                    <h3>Connectivite WiFi Client</h3>
                </div>
                <button
                    type="button"
                    onClick={() => setIsWifiEnabled(!isWifiEnabled)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all ${isWifiEnabled ? 'border-brand bg-brand text-white shadow-lg shadow-emerald-900/10' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">{isWifiEnabled ? 'Active' : 'Desactive'}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${isWifiEnabled ? 'bg-white/20' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${isWifiEnabled ? 'right-1' : 'left-1'}`} />
                    </div>
                </button>
            </div>

            <div className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${isWifiEnabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none grayscale translate-y-2'}`}>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Nom du Reseau (SSID)</label>
                    <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-zinc-900 font-bold transition-all shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Mot de Passe WiFi</label>
                    <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-zinc-900 font-bold font-mono transition-all shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Type de Securite</label>
                    <select
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-zinc-900 font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <option value="WPA2">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Sans Mot de Passe</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
