'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Download, Printer, Upload, RefreshCw, LayoutTemplate, Shapes, Palette, Loader2, Sparkles, Check, FileText, Maximize, Layers, QrCode, ChefHat, Copy } from 'lucide-react'
import { toast } from 'sonner'
import QRCodeStyling, {
    DotType,
    CornerSquareType,
    CornerDotType,
    Options
} from 'qr-code-styling'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function QrPage() {
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [restaurantName, setRestaurantName] = useState('')
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)

    // Mode State
    const [qrMode, setQrMode] = useState<'global' | 'tables'>('global')
    const [tableNumber, setTableNumber] = useState<string>('1')
    const [tableBatchCount, setTableBatchCount] = useState<number>(10)

    // Configuration State
    const [fgColor, setFgColor] = useState('#064e3b')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [includeLogo, setIncludeLogo] = useState(false)
    const [logoSrc, setLogoSrc] = useState<string>('')
    const [logoSize, setLogoSize] = useState(40)

    // Template & Shape States
    const [qrStyle, setQrStyle] = useState<'simple' | 'rounded' | 'card' | 'frame'>('rounded')
    const [dotType, setDotType] = useState<DotType>('extra-rounded')
    const [cornerType, setCornerType] = useState<CornerSquareType>('extra-rounded')
    const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot')

    // NEW: Print & Poster States
    const [printFormat, setPrintFormat] = useState<'QR' | 'A4' | 'A5'>('QR')
    const [posterTemplate, setPosterTemplate] = useState<'classic' | 'modern' | 'luxury' | 'midnight' | 'rustic' | 'ocean'>('classic')

    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)

    const qrRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setBaseUrl(`${window.location.protocol}//${window.location.host}/menu`)

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            let currentId = ''
            let currentName = ''

            const { data: restaurant, error: queryError } = await supabase
                .from('restaurants')
                .select('id, name, qr_settings')
                .eq('owner_id', user.id)
                .single()

            if (queryError) {
                const { data: basicData } = await supabase
                    .from('restaurants')
                    .select('id, name')
                    .eq('owner_id', user.id)
                    .single()
                if (!basicData) { router.push('/admin/onboarding'); return; }
                currentId = basicData.id
                currentName = basicData.name
            } else if (!restaurant) {
                router.push('/admin/onboarding')
                return
            } else {
                currentId = restaurant.id
                currentName = restaurant.name
                if (restaurant.qr_settings && Object.keys(restaurant.qr_settings).length > 0) {
                    const s = restaurant.qr_settings as any
                    if (s.fgColor) setFgColor(s.fgColor)
                    if (s.bgColor) setBgColor(s.bgColor)
                    if (s.qrStyle) setQrStyle(s.qrStyle)
                    if (s.dotType) setDotType(s.dotType)
                    if (s.cornerType) setCornerType(s.cornerType)
                    if (s.cornerDotType) setCornerDotType(s.cornerDotType)
                    if (s.includeLogo !== undefined) setIncludeLogo(s.includeLogo)
                    if (s.logoSrc) setLogoSrc(s.logoSrc)
                    if (s.logoSize) setLogoSize(s.logoSize)
                }
            }

            setRestaurantId(currentId)
            setRestaurantName(currentName)

            const menuUrl = `${window.location.protocol}//${window.location.host}/menu/${currentId}`
            const newQrCode = new QRCodeStyling({
                width: 320,
                height: 320,
                data: menuUrl,
                dotsOptions: { color: fgColor, type: dotType as any },
                backgroundOptions: { color: bgColor },
                imageOptions: { crossOrigin: "anonymous", margin: 10 }
            })
            setQrCode(newQrCode)
            setLoading(false)
        }
        init()
    }, [])

    useEffect(() => {
        if (!qrCode || !restaurantId) return
        const menuUrl = qrMode === 'global' 
            ? `${baseUrl}/${restaurantId}`
            : `${baseUrl}/${restaurantId}?table=${tableNumber}`
            
        const actualBgColor = (qrStyle === 'frame' || qrStyle === 'card') ? '#ffffff' : bgColor

        const options: Partial<Options> = {
            data: menuUrl,
            dotsOptions: { color: fgColor, type: dotType as any },
            backgroundOptions: { color: actualBgColor },
            cornersSquareOptions: { type: cornerType as any, color: fgColor },
            cornersDotOptions: { type: cornerDotType as any, color: fgColor },
            image: includeLogo && logoSrc ? logoSrc : "",
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 10,
                crossOrigin: "anonymous"
            }
        }

        qrCode.update(options)
        if (qrRef.current) {
            qrRef.current.innerHTML = ""
            qrCode.append(qrRef.current)
        }
    }, [qrCode, restaurantId, fgColor, bgColor, includeLogo, logoSrc, logoSize, qrStyle, dotType, cornerType, cornerDotType, baseUrl, qrMode, tableNumber])

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (ev) => {
                setLogoSrc(ev.target?.result as string)
                setIncludeLogo(true)
            }
            reader.readAsDataURL(file)
        }
    }

    const saveSettings = async () => {
        if (!restaurantId) return
        setSaving(true)
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            let finalLogoUrl = logoSrc
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop()
                const fileName = `${restaurantId}/logo-${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('dish-images').upload(fileName, logoFile)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('dish-images').getPublicUrl(fileName)
                finalLogoUrl = publicUrl
            }
            const qr_settings = { fgColor, bgColor, qrStyle, dotType, cornerType, cornerDotType, includeLogo, logoSrc: finalLogoUrl, logoSize }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/settings/${restaurantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ qr_settings })
            })
            if (!res.ok) throw new Error('Failed to save settings')
            setLogoFile(null)
            setLogoSrc(finalLogoUrl)
            toast.success('Settings saved successfully! ✨')
        } catch (err: any) {
            console.error(err)
            toast.error(`Error: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    const downloadQr = async () => {
        if (printFormat === 'QR') {
            const element = document.getElementById('qr-card-to-capture')
            if (element) {
                setSaving(true)
                try {
                    const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3 })
                    const link = document.createElement('a')
                    link.download = `menu-qr-table-${tableNumber}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.png`
                    link.href = dataUrl
                    link.click()
                } catch (err) {
                    toast.error('Download failed.')
                } finally {
                    setSaving(false)
                }
            }
        } else {
            const poster = document.getElementById('printable-area')
            if (poster) {
                setSaving(true)
                try {
                    const dataUrl = await toPng(poster, {
                        quality: 1.0,
                        pixelRatio: 3,
                        skipFonts: false,
                        cacheBust: true,
                        style: {
                            transform: 'scale(1)',
                            margin: '0',
                            left: '0',
                            top: '0'
                        }
                    })
                    const link = document.createElement('a')
                    link.download = `menu-poster-${printFormat}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.png`
                    link.href = dataUrl
                    link.click()
                } catch (err) {
                    console.error('Download failed:', err)
                    toast.error('Download failed. Please try again or use the Print button.')
                } finally {
                    setSaving(false)
                }
            }
        }
    }

    const downloadPdf = async () => {
        const poster = printFormat === 'QR' ? document.getElementById('qr-card-to-capture') : document.getElementById('printable-area')
        if (!poster) return

        setSaving(true)
        try {
            const dataUrl = await toPng(poster, {
                quality: 1.0,
                pixelRatio: 3,
                style: { transform: 'scale(1)', margin: '0' }
            })

            const pdf = new jsPDF({
                orientation: printFormat === 'A4' || printFormat === 'A5' ? 'p' : 'p',
                unit: 'mm',
                format: printFormat === 'QR' ? [100, 100] : printFormat.toLowerCase()
            })

            const width = pdf.internal.pageSize.getWidth()
            const height = pdf.internal.pageSize.getHeight()

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
            pdf.save(`menu-${printFormat.toLowerCase()}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
        } catch (err) {
            console.error('PDF Download failed:', err)
            toast.error('PDF generation failed.')
        } finally {
            setSaving(false)
        }
    }

    const printQr = () => {
        if (printFormat === 'QR') {
            const component = qrRef.current
            if (component) {
                const printWindow = window.open('', '', 'height=600,width=800')
                if (printWindow) {
                    printWindow.document.write('<html><head><title>Print QR</title><style>body { font-family: serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }</style></head><body>')
                    const svg = component.querySelector('svg')
                    if (svg) printWindow.document.write(svg.outerHTML)
                    else {
                        const canvas = component.querySelector('canvas')
                        if (canvas) printWindow.document.write(`<img src="${canvas.toDataURL()}" />`)
                    }
                    printWindow.document.write('</body></html>')
                    printWindow.document.close()
                    setTimeout(() => printWindow.print(), 100)
                }
            }
        } else {
            const poster = document.getElementById('printable-area')
            if (poster) {
                const printWindow = window.open('', '', 'height=800,width=600')
                if (printWindow) {
                    printWindow.document.write(`<html><head><title>Print Poster ${printFormat}</title>`)
                    printWindow.document.write(`<script src="https://cdn.tailwindcss.com"></script>`)
                    printWindow.document.write(`<style>
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        #poster-print { width: ${printFormat === 'A4' ? '210mm' : '148.5mm'}; height: ${printFormat === 'A4' ? '297mm' : '210mm'}; }
                        .font-serif { font-family: 'Playfair Display', serif !important; }
                    </style>`)
                    printWindow.document.write('</head><body>')
                    printWindow.document.write(`<div id="poster-print">`)
                    printWindow.document.write(poster.innerHTML)
                    printWindow.document.write('</div>')
                    printWindow.document.write('</body></html>')
                    printWindow.document.close()
                    setTimeout(() => printWindow.print(), 1000)
                }
            }
        }
    }

    const generateBatchTables = async () => {
        if (!restaurantId || !qrCode) return
        setSaving(true)
        const toastId = toast.loading(`Generating ${tableBatchCount} table QR codes...`)
        
        try {
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: printFormat === 'QR' ? [100, 100] : printFormat.toLowerCase()
            })

            const width = pdf.internal.pageSize.getWidth()
            const height = pdf.internal.pageSize.getHeight()

            for (let i = 1; i <= tableBatchCount; i++) {
                // Update table number state
                setTableNumber(i.toString())
                
                // Wait for state update and QR re-render (important)
                await new Promise(resolve => setTimeout(resolve, 800))

                const element = printFormat === 'QR' ? document.getElementById('qr-card-to-capture') : document.getElementById('printable-area')
                if (element) {
                    const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 })
                    if (i > 1) pdf.addPage()
                    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
                }
                
                toast.loading(`Processing table ${i}/${tableBatchCount}...`, { id: toastId })
            }

            pdf.save(`${restaurantName.replace(/\s+/g, '-')}-tables-1-to-${tableBatchCount}.pdf`)
            toast.success(`Success! ${tableBatchCount} tables generated.`, { id: toastId })
        } catch (err) {
            console.error(err)
            toast.error("Batch generation failed.", { id: toastId })
        } finally {
            setSaving(false)
        }
    }

    const handleCopyLink = () => {
        const menuUrl = qrMode === 'global' 
            ? `${baseUrl}/${restaurantId}`
            : `${baseUrl}/${restaurantId}?table=${tableNumber}`
        navigator.clipboard.writeText(menuUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#064e3b]" />
            <p className="font-medium animate-pulse">Initializing QR Designer...</p>
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h2 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">QR Design Studio</h2>
                <p className="text-zinc-500 mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                    Create a unique physical gateway to your digital menu
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-5 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 custom-scrollbar pb-20">
                    
                    {/* SECTION: MODE SELECTOR */}
                    <div className="bg-white p-2 rounded-[2rem] border border-black/5 flex gap-2 shadow-sm">
                        <button 
                            type="button"
                            onClick={() => setQrMode('global')}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${qrMode === 'global' ? 'bg-[#064e3b] text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                        >
                            Global QR
                        </button>
                        <button 
                            type="button"
                            onClick={() => setQrMode('tables')}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${qrMode === 'tables' ? 'bg-[#c5a059] text-[#064e3b] shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                        >
                            Table QR Codes
                        </button>
                    </div>

                    {/* SECTION: TABLE CONFIG */}
                    {qrMode === 'tables' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                                <Layers className="w-5 h-5 mr-3 text-[#c5a059]" />
                                <h3>Table Setup</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Live Preview (Table #)</label>
                                    <input 
                                        type="text" 
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold shadow-sm"
                                    />
                                </div>
                                <div className="pt-4 border-t border-black/5">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Export All Tables</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={tableBatchCount}
                                            onChange={(e) => setTableBatchCount(parseInt(e.target.value) || 1)}
                                            className="w-20 px-4 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-[#064e3b] outline-none text-sm font-bold shadow-sm"
                                        />
                                        <button 
                                            type="button"
                                            onClick={generateBatchTables}
                                            disabled={saving}
                                            className="flex-1 bg-[#064e3b] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#053e2f] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 disabled:opacity-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Generate 1 to {tableBatchCount}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#064e3b] p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/20 text-white">
                        <div className="flex items-center mb-4 text-[#c5a059] font-black uppercase tracking-[0.2em] text-[10px]">
                            <Layers className="w-4 h-4 mr-2" />
                            <h3>Direct Menu Link</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10">
                            <input type="text" readOnly value={`${baseUrl}/${restaurantId}`} className="bg-transparent border-none text-xs font-medium flex-1 px-2 outline-none text-emerald-50 truncate" />
                            <button onClick={handleCopyLink} className={`p-3 rounded-xl transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-[#c5a059] text-[#064e3b] hover:scale-105'}`}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="text-[10px] font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                        <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <LayoutTemplate className="w-5 h-5 mr-3 text-[#c5a059]" />
                            <h3>1. Premium Layout</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['simple', 'rounded', 'card', 'frame'].map((style) => (
                                <button key={style} onClick={() => setQrStyle(style as any)} className={`py-4 px-3 text-sm font-bold rounded-2xl border capitalize transition-all duration-300 ${qrStyle === style ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xl shadow-emerald-900/20 scale-[1.02]' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-emerald-200 hover:bg-white'}`}>{style}</button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                        <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Shapes className="w-5 h-5 mr-3 text-[#c5a059]" />
                            <h3>2. Geometric Details</h3>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Dot Architecture</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map((type) => (
                                        <button key={type} onClick={() => setDotType(type as DotType)} className={`py-2.5 px-1 text-[10px] font-black rounded-xl border truncate transition-all ${dotType === type ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-md' : 'bg-white text-zinc-500 border-zinc-100 hover:bg-zinc-50'}`}>{type.replace('-', ' ')}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Corner Frame</label>
                                    <div className="flex gap-2">
                                        {['square', 'dot', 'extra-rounded'].map((type) => (
                                            <button key={type} onClick={() => setCornerType(type as CornerSquareType)} className={`flex-1 py-4 px-1 rounded-2xl border transition-all ${cornerType === type ? 'bg-[#064e3b] border-[#064e3b]' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}><div className={`w-5 h-5 mx-auto border-2 ${cornerType === type ? 'border-[#c5a059]' : 'border-zinc-300'} ${type === 'dot' ? 'rounded-full' : type === 'extra-rounded' ? 'rounded-lg' : ''}`}></div></button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Inner Eye</label>
                                    <div className="flex gap-2">
                                        {['square', 'dot'].map((type) => (
                                            <button key={type} onClick={() => setCornerDotType(type as CornerDotType)} className={`flex-1 py-4 px-1 rounded-2xl border transition-all ${cornerDotType === type ? 'bg-[#064e3b] border-[#064e3b]' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}><div className={`w-3.5 h-3.5 mx-auto ${cornerDotType === type ? 'bg-[#c5a059]' : 'bg-zinc-300'} ${type === 'dot' ? 'rounded-full' : ''}`}></div></button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                        <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Palette className="w-5 h-5 mr-3 text-[#c5a059]" />
                            <h3>3. Brand Identity</h3>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="relative flex flex-col items-center gap-3 cursor-pointer p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 transition-all group"><div style={{ backgroundColor: bgColor }} className="w-12 h-12 rounded-full border border-white shadow-md group-hover:scale-110 transition-transform"></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paper</span><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" /></label>
                                <label className="relative flex flex-col items-center gap-3 cursor-pointer p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 transition-all group"><div style={{ backgroundColor: fgColor }} className="w-12 h-12 rounded-full border border-white shadow-md group-hover:scale-110 transition-transform"></div><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ink Color</span><input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" /></label>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Logo Overlay {includeLogo && <button onClick={() => { setIncludeLogo(false); setLogoSrc('') }} className="text-red-500 hover:underline">Remove</button>}</div>
                                {!includeLogo ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-100 border-dashed rounded-[2rem] cursor-pointer hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group"><Upload className="w-8 h-8 mb-2 text-zinc-200 group-hover:text-[#064e3b]" /><p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Drop PNG Logo</p><input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>
                                ) : (
                                    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-6 shadow-inner">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-black/5 shadow-sm shrink-0">{logoSrc && <img src={logoSrc} className="w-full h-full object-contain" alt="Logo preview" />}</div>
                                        <div className="flex-1 space-y-3"><label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Logo Scaling</label><input type="range" min="20" max="60" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#c5a059]" /></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                            <FileText className="w-5 h-5 mr-3 text-[#c5a059]" />
                            <h3>4. Format & Poster</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Output Format</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'QR', icon: QrCode, label: 'QR Only' },
                                        { id: 'A5', icon: FileText, label: 'A5 Poster' },
                                        { id: 'A4', icon: Maximize, label: 'A4 Poster' }
                                    ].map((f) => (
                                        <button key={f.id} onClick={() => setPrintFormat(f.id as any)} className={`py-3 px-1 flex flex-col items-center gap-2 rounded-xl border transition-all ${printFormat === f.id ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-md scale-105' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-white'}`}><f.icon className="w-4 h-4" /><span className="text-[10px] font-bold">{f.label}</span></button>
                                    ))}
                                </div>
                            </div>
                            {printFormat !== 'QR' && (
                                <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Poster Theme</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['classic', 'modern', 'luxury', 'midnight', 'rustic', 'ocean'].map((t) => (
                                            <button key={t} onClick={() => setPosterTemplate(t as any)} className={`py-2.5 px-1 text-[10px] font-black rounded-xl border transition-all ${posterTemplate === t ? 'bg-[#c5a059] text-[#064e3b] border-[#c5a059] shadow-sm' : 'bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-[#fdfcfb] rounded-[4rem] p-8 flex flex-col items-center justify-center border-4 border-white shadow-inner min-h-[700px] relative overflow-hidden group/preview">
                    <div className={`transition-all duration-700 ease-out transform group-hover/preview:scale-[1.01] z-10 ${printFormat === 'A4' ? 'scale-[0.45]' : printFormat === 'A5' ? 'scale-[0.6]' : ''}`}>
                        <div id="printable-area" className={`relative transition-all duration-700 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)]
                            ${printFormat === 'A4' ? 'w-[794px] h-[1123px]' : printFormat === 'A5' ? 'w-[561px] h-[794px]' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'classic' ? 'bg-[#064e3b] text-white border-none' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'modern' ? 'bg-[#fffcf0] text-zinc-800 border-none' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'luxury' ? 'bg-white text-zinc-900 border-[24px] border-[#c5a059] outline-[1px] outline-dashed outline-[#c5a059] outline-offset-[-12px]' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'midnight' ? 'bg-[#09090b] text-white border-none' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'rustic' ? 'bg-[#f5f5f4] text-[#44403c] border-[16px] border-[#d6d3d1]' : ''}
                            ${printFormat !== 'QR' && posterTemplate === 'ocean' ? 'bg-[#0c4a6e] text-white border-none' : ''}
                            ${printFormat === 'QR' ? 'contents' : 'flex flex-col items-center justify-between'}
                            ${printFormat === 'A4' ? 'py-24 px-16' : printFormat === 'A5' ? 'py-16 px-10' : ''}
                        `}>
                            {printFormat !== 'QR' && (
                                <div className="text-center w-full animate-in fade-in duration-1000">
                                    <div className={`mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl 
                                        ${posterTemplate === 'classic' ? 'bg-[#c5a059] text-[#064e3b]' : ''}
                                        ${posterTemplate === 'modern' ? 'bg-[#064e3b] text-white' : ''}
                                        ${posterTemplate === 'luxury' ? 'bg-[#064e3b] text-white' : ''}
                                        ${posterTemplate === 'midnight' ? 'bg-[#c5a059] text-[#09090b]' : ''}
                                        ${posterTemplate === 'rustic' ? 'bg-[#44403c] text-[#f5f5f4]' : ''}
                                        ${posterTemplate === 'ocean' ? 'bg-[#c5a059] text-[#0c4a6e]' : ''}
                                        ${printFormat === 'A4' ? 'w-24 h-24 mb-10' : 'w-16 h-16 mb-6'}
                                    `}><ChefHat className={printFormat === 'A4' ? 'w-14 h-14' : 'w-10 h-10'} /></div>
                                    <h3 className={`font-bold tracking-tight italic ${posterTemplate === 'modern' ? 'font-sans uppercase tracking-[0.1em] text-zinc-900' : 'font-serif'} ${posterTemplate === 'luxury' ? 'text-[#c5a059] underline decoration-[#c5a059]/20 underline-offset-8' : ''} ${posterTemplate === 'classic' ? 'text-white underline decoration-[#c5a059]/30 underline-offset-8' : ''} ${posterTemplate === 'midnight' ? '!text-white underline decoration-[#c5a059]/20 underline-offset-8' : ''} ${posterTemplate === 'rustic' ? 'text-[#44403c]' : ''} ${posterTemplate === 'ocean' ? '!text-white' : ''} ${printFormat === 'A4' ? 'text-7xl mb-4' : 'text-5xl mb-2'}`}>{restaurantName || 'NOUR'}</h3>
                                    <p className={`font-black tracking-[0.6em] uppercase ${posterTemplate === 'classic' ? 'text-emerald-100/60' : ''} ${posterTemplate === 'modern' ? 'text-zinc-400' : ''} ${posterTemplate === 'luxury' ? 'text-zinc-400' : ''} ${posterTemplate === 'midnight' ? 'text-zinc-500' : ''} ${posterTemplate === 'rustic' ? 'text-[#78716c]' : ''} ${posterTemplate === 'ocean' ? 'text-sky-200/60' : ''} ${printFormat === 'A4' ? 'text-[14px] mt-6' : 'text-[10px] mt-4'}`}>Digital Menu Experience</p>
                                </div>
                            )}
                            <div id="qr-card-to-capture" className={`relative transition-all duration-700 flex flex-col items-center justify-center ${printFormat === 'QR' && qrStyle === 'simple' ? 'bg-white p-12 shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5' : ''} ${printFormat === 'QR' && qrStyle === 'rounded' ? 'bg-white p-12 rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5' : ''} ${printFormat === 'QR' && qrStyle === 'card' ? 'bg-white p-12 pb-20 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5 min-w-[440px]' : ''} ${printFormat === 'QR' && qrStyle === 'frame' ? 'bg-[#053e2f] p-16 pb-24 rounded-[6rem] shadow-[0_70px_140px_rgba(0,0,0,0.2)] border-[12px] border-[#064e3b]/20' : ''} ${printFormat !== 'QR' ? 'my-auto bg-white shadow-2xl transition-all' : ''} ${printFormat === 'A4' ? 'p-10 rounded-[4rem] scale-[1.4]' : printFormat === 'A5' ? 'p-6 rounded-[3rem] scale-[1.1]' : ''}`}>
                                {qrMode === 'tables' && (
                                    <div className="mb-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="h-[1px] w-6 bg-[#c5a059]/40"></div>
                                            <span className="text-[14px] font-black text-[#064e3b] uppercase tracking-[0.3em]">Table</span>
                                            <div className="h-[1px] w-6 bg-[#c5a059]/40"></div>
                                        </div>
                                        <span className="text-5xl font-serif font-bold text-[#064e3b] mt-1">{tableNumber}</span>
                                    </div>
                                )}
                                <div className={`overflow-hidden transition-all duration-700 ${printFormat === 'QR' && qrStyle === 'frame' ? 'p-6 bg-white rounded-[3.5rem] shadow-2xl' : ''} ${printFormat === 'QR' && qrStyle === 'rounded' ? 'rounded-[3.5rem]' : ''} ${printFormat !== 'QR' ? 'rounded-[2.5rem]' : ''} relative`} ref={qrRef}>
                                </div>
                            </div>
                            {printFormat !== 'QR' && (
                                <div className={`text-center w-full ${printFormat === 'A4' ? 'space-y-4' : 'space-y-2'}`}><p className={`font-serif font-bold italic tracking-wide ${printFormat === 'A4' ? 'text-2xl' : 'text-xl'}`}>Scan to discover our menu</p><div className="flex items-center justify-center gap-3"><div className={`h-px w-8 ${posterTemplate === 'classic' ? 'bg-emerald-100/20' : ''} ${posterTemplate === 'midnight' ? 'bg-zinc-800' : ''} ${posterTemplate === 'rustic' ? 'bg-stone-300' : ''} ${posterTemplate === 'ocean' ? 'bg-sky-900/40' : 'bg-zinc-200'}`}></div><p className={`font-black tracking-[0.3em] uppercase ${posterTemplate === 'classic' ? 'text-emerald-100/40' : ''} ${posterTemplate === 'midnight' ? 'text-zinc-600' : ''} ${posterTemplate === 'rustic' ? 'text-stone-400' : ''} ${posterTemplate === 'ocean' ? 'text-sky-300/40' : 'text-zinc-400'} ${printFormat === 'A4' ? 'text-[10px]' : 'text-[8px]'}`}>noremenu.com</p><div className={`h-px w-8 ${posterTemplate === 'classic' ? 'bg-emerald-100/20' : ''} ${posterTemplate === 'midnight' ? 'bg-zinc-800' : ''} ${posterTemplate === 'rustic' ? 'bg-stone-300' : ''} ${posterTemplate === 'ocean' ? 'bg-sky-900/40' : 'bg-zinc-200'}`}></div></div></div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[3rem] border border-black/5 shadow-sm mt-4">
                     <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={downloadQr} className="flex-1 md:flex-none bg-zinc-900 text-white px-8 py-5 rounded-2xl font-bold text-sm tracking-wide hover:bg-black transition shadow-xl shadow-black/10 flex items-center justify-center group"><Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> PNG</button>
                        <button onClick={downloadPdf} className="flex-1 md:flex-none bg-[#064e3b] text-white px-8 py-5 rounded-2xl font-bold text-sm tracking-wide hover:bg-[#053e2f] transition shadow-xl shadow-emerald-900/10 flex items-center justify-center group"><FileText className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> PDF</button>
                        <button onClick={printQr} className="flex-1 md:flex-none bg-white text-zinc-800 border-2 border-zinc-100 px-8 py-5 rounded-2xl font-bold text-sm tracking-wide hover:bg-zinc-50 transition flex items-center justify-center"><Printer className="w-5 h-5 mr-3" /> Print</button>
                     </div>
                     <button disabled={saving} onClick={saveSettings} className="w-full md:w-auto bg-[#c5a059] text-[#064e3b] px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-[#b59049] transition-all shadow-2xl shadow-amber-900/10 flex items-center justify-center disabled:opacity-50 hover:-translate-y-1 active:translate-y-0">{saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}{saving ? 'Saving...' : 'Confirm & Save Design'}</button>
                </div>
            </div>
        </div>
    )
}
