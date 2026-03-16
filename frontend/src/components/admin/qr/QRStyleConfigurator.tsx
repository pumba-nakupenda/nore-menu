'use client'

import { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'
import { Download, Upload, LayoutTemplate, Shapes, Palette, Sparkles, Check, FileText, Maximize, Layers, QrCode, Copy } from 'lucide-react'

interface QRStyleConfiguratorProps {
    restaurantId: string | null
    baseUrl: string
    copied: boolean
    qrMode: string
    setQrMode: (v: 'global' | 'tables') => void
    tableNumber: string
    setTableNumber: (v: string) => void
    tableBatchCount: number
    setTableBatchCount: (v: number) => void
    fgColor: string
    setFgColor: (v: string) => void
    bgColor: string
    setBgColor: (v: string) => void
    includeLogo: boolean
    setIncludeLogo: (v: boolean) => void
    logoSrc: string
    setLogoSrc: (v: string) => void
    logoSize: number
    setLogoSize: (v: number) => void
    qrStyle: string
    setQrStyle: (v: any) => void
    dotType: DotType
    setDotType: (v: DotType) => void
    cornerType: CornerSquareType
    setCornerType: (v: CornerSquareType) => void
    cornerDotType: CornerDotType
    setCornerDotType: (v: CornerDotType) => void
    printFormat: string
    setPrintFormat: (v: any) => void
    posterTemplate: string
    setPosterTemplate: (v: any) => void
    saving: boolean
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleCopyLink: () => void
    generateBatchTables: () => void
}

export default function QRStyleConfigurator(props: QRStyleConfiguratorProps) {
    const {
        restaurantId, baseUrl, copied,
        qrMode, setQrMode, tableNumber, setTableNumber, tableBatchCount, setTableBatchCount,
        fgColor, setFgColor, bgColor, setBgColor, includeLogo, setIncludeLogo, logoSrc, setLogoSrc, logoSize, setLogoSize,
        qrStyle, setQrStyle, dotType, setDotType, cornerType, setCornerType, cornerDotType, setCornerDotType,
        printFormat, setPrintFormat, posterTemplate, setPosterTemplate,
        saving, handleLogoUpload, handleCopyLink, generateBatchTables
    } = props

    return (
        <div className="order-2 lg:order-1 lg:col-span-5 space-y-8 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-0 lg:pr-4 custom-scrollbar pb-10 w-full">
            {/* MODE SELECTOR */}
            <div className="bg-white p-2 rounded-[2rem] border border-black/5 flex gap-2 shadow-sm">
                <button type="button" onClick={() => setQrMode('global')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${qrMode === 'global' ? 'bg-brand text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}>QR Global</button>
                <button type="button" onClick={() => setQrMode('tables')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${qrMode === 'tables' ? 'bg-gold text-brand shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}>QR Codes Tables</button>
            </div>

            {/* TABLE CONFIG */}
            {qrMode === 'tables' && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]"><Layers className="w-5 h-5 mr-3 text-gold" /><h3>Configuration Tables</h3></div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Aperçu Live (N° Table)</label>
                            <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-bold shadow-sm" />
                        </div>
                        <div className="pt-4 border-t border-black/5">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Exporter toutes les tables</label>
                            <div className="flex gap-2">
                                <input type="number" value={tableBatchCount} onChange={(e) => setTableBatchCount(parseInt(e.target.value) || 1)} className="w-20 px-4 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-bold shadow-sm" />
                                <button type="button" onClick={generateBatchTables} disabled={saving} className="flex-1 bg-brand text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 disabled:opacity-50"><Download className="w-4 h-4" />Générer 1 à {tableBatchCount}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MENU LINK */}
            <div className="bg-brand p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/20 text-white">
                <div className="flex items-center mb-4 text-gold font-black uppercase tracking-[0.2em] text-[10px]"><Layers className="w-4 h-4 mr-2" /><h3>Lien Direct du Menu</h3></div>
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10">
                    <input type="text" readOnly value={`${baseUrl}/${restaurantId}`} className="bg-transparent border-none text-[10px] font-medium flex-1 px-2 outline-none text-emerald-50 truncate w-full" />
                    <button onClick={handleCopyLink} className={`w-full sm:w-auto p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-gold text-brand hover:scale-105'}`}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}<span className="text-[10px] font-bold uppercase">{copied ? 'Copié' : 'Copier'}</span></button>
                </div>
            </div>

            {/* QR STYLE */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]"><LayoutTemplate className="w-5 h-5 mr-3 text-gold" /><h3>1. Style de Mise en Page</h3></div>
                <div className="grid grid-cols-2 gap-3">
                    {['simple', 'rounded', 'card', 'frame'].map((style) => (
                        <button key={style} onClick={() => setQrStyle(style)} className={`py-4 px-3 text-[10px] md:text-sm font-bold rounded-2xl border capitalize transition-all duration-300 ${qrStyle === style ? 'bg-brand text-white border-brand shadow-xl' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-emerald-200 hover:bg-white'}`}>{style}</button>
                    ))}
                </div>
            </div>

            {/* DOT & CORNER */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]"><Shapes className="w-5 h-5 mr-3 text-gold" /><h3>2. Détails Géométriques</h3></div>
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Architecture des Points</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map((type) => (
                                <button key={type} onClick={() => setDotType(type as DotType)} className={`py-2.5 px-1 text-[9px] font-black rounded-xl border truncate transition-all ${dotType === type ? 'bg-brand text-white border-brand shadow-md' : 'bg-white text-zinc-500 border-zinc-100 hover:bg-zinc-50'}`}>{type.replace('-', ' ')}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Cadre des Coins</label>
                            <div className="flex gap-2">
                                {['square', 'dot', 'extra-rounded'].map((type) => (
                                    <button key={type} onClick={() => setCornerType(type as CornerSquareType)} className={`flex-1 py-4 px-1 rounded-2xl border transition-all ${cornerType === type ? 'bg-brand border-brand' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}><div className={`w-5 h-5 mx-auto border-2 ${cornerType === type ? 'border-gold' : 'border-zinc-300'} ${type === 'dot' ? 'rounded-full' : type === 'extra-rounded' ? 'rounded-lg' : ''}`}></div></button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Oeil Interne</label>
                            <div className="flex gap-2">
                                {['square', 'dot'].map((type) => (
                                    <button key={type} onClick={() => setCornerDotType(type as CornerDotType)} className={`flex-1 py-4 px-1 rounded-2xl border transition-all ${cornerDotType === type ? 'bg-brand border-brand' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}><div className={`w-3.5 h-3.5 mx-auto ${cornerDotType === type ? 'bg-gold' : 'bg-zinc-300'} ${type === 'dot' ? 'rounded-full' : ''}`}></div></button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLORS & LOGO */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]"><Palette className="w-5 h-5 mr-3 text-gold" /><h3>3. Identité de Marque</h3></div>
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="relative flex flex-col items-center gap-3 cursor-pointer p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 transition-all group"><div style={{ backgroundColor: bgColor }} className="w-12 h-12 rounded-full border border-white shadow-md group-hover:scale-110 transition-transform"></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fond (Papier)</span><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" /></label>
                        <label className="relative flex flex-col items-center gap-3 cursor-pointer p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 transition-all group"><div style={{ backgroundColor: fgColor }} className="w-12 h-12 rounded-full border border-white shadow-md group-hover:scale-110 transition-transform"></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Couleur (Encre)</span><input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" /></label>
                    </div>
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Incrustation Logo {includeLogo && <button onClick={() => { setIncludeLogo(false); setLogoSrc('') }} className="text-red-500 hover:underline">Supprimer</button>}</div>
                        {!includeLogo ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-100 border-dashed rounded-[2rem] cursor-pointer hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group"><Upload className="w-8 h-8 mb-2 text-zinc-200 group-hover:text-brand" /><p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Déposer un Logo PNG</p><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>
                        ) : (
                            <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-6 shadow-inner">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-black/5 shadow-sm shrink-0">{logoSrc && <img src={logoSrc} className="w-full h-full object-contain" alt="Aperçu logo" />}</div>
                                <div className="flex-1 space-y-3"><label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Taille du Logo</label><input type="range" min="20" max="60" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-gold" /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FORMAT & POSTER */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]"><FileText className="w-5 h-5 mr-3 text-gold" /><h3>4. Format & Poster</h3></div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Format de Sortie</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ id: 'QR', icon: QrCode, label: 'QR Seul' }, { id: 'A5', icon: FileText, label: 'Poster A5' }, { id: 'A4', icon: Maximize, label: 'Poster A4' }].map((f) => (
                                <button key={f.id} onClick={() => setPrintFormat(f.id)} className={`py-3 px-1 flex flex-col items-center gap-2 rounded-xl border transition-all ${printFormat === f.id ? 'bg-brand text-white border-brand shadow-md scale-105' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-white'}`}><f.icon className="w-4 h-4" /><span className="text-[9px] font-bold">{f.label}</span></button>
                            ))}
                        </div>
                    </div>
                    {printFormat !== 'QR' && (
                        <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Thème du Poster</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['classic', 'modern', 'luxury', 'midnight', 'rustic', 'ocean'].map((t) => (
                                    <button key={t} onClick={() => setPosterTemplate(t)} className={`py-2.5 px-1 text-[9px] font-black rounded-xl border transition-all ${posterTemplate === t ? 'bg-gold text-brand border-gold shadow-sm' : 'bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
