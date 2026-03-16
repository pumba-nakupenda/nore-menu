'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQRGenerator } from '@/hooks/useQRGenerator'
import QRPreview from '@/components/admin/qr/QRPreview'
import QRStyleConfigurator from '@/components/admin/qr/QRStyleConfigurator'
import { Download, Printer, Loader2, Check, FileText } from 'lucide-react'

export default function QrPage() {
    const { restaurantId, restaurant, token } = useAuth()
    const restaurantName = restaurant?.name || ''

    const qr = useQRGenerator({
        restaurantId,
        restaurantName,
        token,
        qrSettings: restaurant?.qr_settings,
    })

    if (qr.loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            <p className="font-medium animate-pulse">Initialisation du QR Designer...</p>
        </div>
    )

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 tracking-tight text-center lg:text-left">QR Design Studio</h2>
                <p className="text-zinc-500 mt-2 flex items-center justify-center lg:justify-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    Créez une porte d'entrée physique unique vers votre menu digital
                </p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                <QRPreview
                    restaurantName={restaurantName}
                    qrRef={qr.qrRef}
                    qrMode={qr.qrMode}
                    tableNumber={qr.tableNumber}
                    printFormat={qr.printFormat}
                    posterTemplate={qr.posterTemplate}
                    qrStyle={qr.qrStyle}
                />
                <QRStyleConfigurator
                    restaurantId={restaurantId}
                    baseUrl={qr.baseUrl}
                    copied={qr.copied}
                    qrMode={qr.qrMode}
                    setQrMode={qr.setQrMode}
                    tableNumber={qr.tableNumber}
                    setTableNumber={qr.setTableNumber}
                    tableBatchCount={qr.tableBatchCount}
                    setTableBatchCount={qr.setTableBatchCount}
                    fgColor={qr.fgColor}
                    setFgColor={qr.setFgColor}
                    bgColor={qr.bgColor}
                    setBgColor={qr.setBgColor}
                    includeLogo={qr.includeLogo}
                    setIncludeLogo={qr.setIncludeLogo}
                    logoSrc={qr.logoSrc}
                    setLogoSrc={qr.setLogoSrc}
                    logoSize={qr.logoSize}
                    setLogoSize={qr.setLogoSize}
                    qrStyle={qr.qrStyle}
                    setQrStyle={qr.setQrStyle}
                    dotType={qr.dotType}
                    setDotType={qr.setDotType}
                    cornerType={qr.cornerType}
                    setCornerType={qr.setCornerType}
                    cornerDotType={qr.cornerDotType}
                    setCornerDotType={qr.setCornerDotType}
                    printFormat={qr.printFormat}
                    setPrintFormat={qr.setPrintFormat}
                    posterTemplate={qr.posterTemplate}
                    setPosterTemplate={qr.setPosterTemplate}
                    saving={qr.saving}
                    handleLogoUpload={qr.handleLogoUpload}
                    handleCopyLink={qr.handleCopyLink}
                    generateBatchTables={qr.generateBatchTables}
                />
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between bg-white p-6 md:p-8 rounded-[3rem] border border-black/5 shadow-2xl mt-4">
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                    <button onClick={qr.downloadQr} className="bg-zinc-900 text-white py-4 px-2 md:px-8 rounded-2xl font-bold text-xs tracking-wide hover:bg-black transition shadow-xl flex items-center justify-center group"><Download className="w-4 h-4 mr-2" /> PNG</button>
                    <button onClick={qr.downloadPdf} className="bg-brand text-white py-4 px-2 md:px-8 rounded-2xl font-bold text-xs tracking-wide hover:bg-brand-dark transition shadow-xl flex items-center justify-center group"><FileText className="w-4 h-4 mr-2" /> PDF</button>
                    <button onClick={qr.printQr} className="bg-white text-zinc-800 border-2 border-zinc-100 py-4 px-2 md:px-8 rounded-2xl font-bold text-xs tracking-wide hover:bg-zinc-50 transition flex items-center justify-center"><Printer className="w-4 h-4 mr-2" /> Imprimer</button>
                </div>
                <button disabled={qr.saving} onClick={qr.saveSettings} className="w-full md:w-auto bg-gold text-brand px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-[#b59049] transition-all shadow-2xl flex items-center justify-center disabled:opacity-50 active:scale-95">
                    {qr.saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}
                    {qr.saving ? 'Sauvegarde...' : 'Enregistrer le Design'}
                </button>
            </div>
        </div>
    )
}
