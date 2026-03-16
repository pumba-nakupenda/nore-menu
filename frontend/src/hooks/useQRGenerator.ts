'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import QRCodeStyling, {
    DotType,
    CornerSquareType,
    CornerDotType,
    Options
} from 'qr-code-styling'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

interface UseQRGeneratorProps {
    restaurantId: string | null
    restaurantName: string
    token: string | null
    qrSettings?: any
}

export function useQRGenerator({ restaurantId, restaurantName, token, qrSettings }: UseQRGeneratorProps) {
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')
    const [copied, setCopied] = useState(false)
    const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
    const [qrMode, setQrMode] = useState<'global' | 'tables'>('global')
    const [tableNumber, setTableNumber] = useState<string>('1')
    const [tableBatchCount, setTableBatchCount] = useState<number>(10)
    const [fgColor, setFgColor] = useState('#064e3b')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [includeLogo, setIncludeLogo] = useState(false)
    const [logoSrc, setLogoSrc] = useState<string>('')
    const [logoSize, setLogoSize] = useState(40)
    const [qrStyle, setQrStyle] = useState<'simple' | 'rounded' | 'card' | 'frame'>('rounded')
    const [dotType, setDotType] = useState<DotType>('extra-rounded')
    const [cornerType, setCornerType] = useState<CornerSquareType>('extra-rounded')
    const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot')
    const [printFormat, setPrintFormat] = useState<'QR' | 'A4' | 'A5'>('QR')
    const [posterTemplate, setPosterTemplate] = useState<'classic' | 'modern' | 'luxury' | 'midnight' | 'rustic' | 'ocean'>('classic')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const qrRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setBaseUrl(`${window.location.protocol}//${window.location.host}/menu`)
    }, [])

    useEffect(() => {
        if (!restaurantId) return
        if (qrSettings && Object.keys(qrSettings).length > 0) {
            const s = qrSettings as any
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
        const menuUrl = `${window.location.protocol}//${window.location.host}/menu/${restaurantId}`
        const newQrCode = new QRCodeStyling({
            width: 320, height: 320, data: menuUrl,
            dotsOptions: { color: fgColor, type: dotType as any },
            backgroundOptions: { color: bgColor },
            imageOptions: { crossOrigin: "anonymous", margin: 10 }
        })
        setQrCode(newQrCode)
        setLoading(false)
    }, [restaurantId])

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
            imageOptions: { hideBackgroundDots: true, imageSize: logoSize / 100, margin: 10, crossOrigin: "anonymous" }
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
            reader.onload = (ev) => { setLogoSrc(ev.target?.result as string); setIncludeLogo(true) }
            reader.readAsDataURL(file)
        }
    }

    const saveSettings = async () => {
        if (!restaurantId) return
        setSaving(true)
        try {
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
            if (!res.ok) throw new Error('Échec de la sauvegarde')
            setLogoFile(null)
            setLogoSrc(finalLogoUrl)
            toast.success('Réglages enregistrés ! ✨')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally { setSaving(false) }
    }

    const downloadQr = async () => {
        const element = printFormat === 'QR' ? document.getElementById('qr-card-to-capture') : document.getElementById('printable-area')
        if (!element) return
        setSaving(true)
        try {
            const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3, ...(printFormat !== 'QR' ? { skipFonts: false, cacheBust: true, style: { transform: 'scale(1)', margin: '0', left: '0', top: '0' } } : {}) })
            const link = document.createElement('a')
            link.download = printFormat === 'QR'
                ? `menu-qr-table-${tableNumber}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.png`
                : `menu-poster-${printFormat}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.png`
            link.href = dataUrl
            link.click()
        } catch { toast.error('Échec du téléchargement.') } finally { setSaving(false) }
    }

    const downloadPdf = async () => {
        const poster = printFormat === 'QR' ? document.getElementById('qr-card-to-capture') : document.getElementById('printable-area')
        if (!poster) return
        setSaving(true)
        try {
            const dataUrl = await toPng(poster, { quality: 1.0, pixelRatio: 3, style: { transform: 'scale(1)', margin: '0' } })
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: printFormat === 'QR' ? [100, 100] : printFormat.toLowerCase() })
            const width = pdf.internal.pageSize.getWidth()
            const height = pdf.internal.pageSize.getHeight()
            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
            pdf.save(`menu-${printFormat.toLowerCase()}-${restaurantName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
        } catch { toast.error('Échec de la génération PDF.') } finally { setSaving(false) }
    }

    const printQr = () => {
        if (printFormat === 'QR') {
            const component = qrRef.current
            if (component) {
                const printWindow = window.open('', '', 'height=600,width=800')
                if (printWindow) {
                    printWindow.document.write('<html><head><title>Imprimer QR</title><style>body { font-family: serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }</style></head><body>')
                    const svg = component.querySelector('svg')
                    if (svg) printWindow.document.write(svg.outerHTML)
                    else { const canvas = component.querySelector('canvas'); if (canvas) printWindow.document.write(`<img src="${canvas.toDataURL()}" />`) }
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
                    printWindow.document.write(`<html><head><title>Imprimer Poster ${printFormat}</title><script src="https://cdn.tailwindcss.com"></script><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');body{margin:0;padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}#poster-print{width:${printFormat === 'A4' ? '210mm' : '148.5mm'};height:${printFormat === 'A4' ? '297mm' : '210mm'}}.font-serif{font-family:'Playfair Display',serif!important}</style></head><body><div id="poster-print">${poster.innerHTML}</div></body></html>`)
                    printWindow.document.close()
                    setTimeout(() => printWindow.print(), 1000)
                }
            }
        }
    }

    const generateBatchTables = async () => {
        if (!restaurantId || !qrCode) return
        setSaving(true)
        const toastId = toast.loading(`Génération de ${tableBatchCount} QR codes tables...`)
        try {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: printFormat === 'QR' ? [100, 100] : printFormat.toLowerCase() })
            const width = pdf.internal.pageSize.getWidth()
            const height = pdf.internal.pageSize.getHeight()
            for (let i = 1; i <= tableBatchCount; i++) {
                setTableNumber(i.toString())
                await new Promise(resolve => setTimeout(resolve, 800))
                const element = printFormat === 'QR' ? document.getElementById('qr-card-to-capture') : document.getElementById('printable-area')
                if (element) {
                    const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 })
                    if (i > 1) pdf.addPage()
                    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
                }
                toast.loading(`Traitement table ${i}/${tableBatchCount}...`, { id: toastId })
            }
            pdf.save(`${restaurantName.replace(/\s+/g, '-')}-tables-1-a-${tableBatchCount}.pdf`)
            toast.success(`Succès ! ${tableBatchCount} tables générées.`, { id: toastId })
        } catch { toast.error("Échec de la génération en lot.", { id: toastId }) } finally { setSaving(false) }
    }

    const handleCopyLink = () => {
        const menuUrl = qrMode === 'global' ? `${baseUrl}/${restaurantId}` : `${baseUrl}/${restaurantId}?table=${tableNumber}`
        navigator.clipboard.writeText(menuUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return {
        loading, baseUrl, copied, qrRef, saving,
        qrMode, setQrMode, tableNumber, setTableNumber, tableBatchCount, setTableBatchCount,
        fgColor, setFgColor, bgColor, setBgColor, includeLogo, setIncludeLogo, logoSrc, setLogoSrc, logoSize, setLogoSize,
        qrStyle, setQrStyle, dotType, setDotType, cornerType, setCornerType, cornerDotType, setCornerDotType,
        printFormat, setPrintFormat, posterTemplate, setPosterTemplate,
        handleLogoUpload, saveSettings, downloadQr, downloadPdf, printQr, generateBatchTables, handleCopyLink,
    }
}
