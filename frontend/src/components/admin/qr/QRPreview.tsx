'use client'

import { RefObject } from 'react'
import { ChefHat } from 'lucide-react'

interface QRPreviewProps {
    restaurantName: string
    qrRef: RefObject<HTMLDivElement | null>
    qrMode: string
    tableNumber: string
    printFormat: string
    posterTemplate: string
    qrStyle: string
}

export default function QRPreview({ restaurantName, qrRef, qrMode, tableNumber, printFormat, posterTemplate, qrStyle }: QRPreviewProps) {
    return (
        <div className="order-1 lg:order-2 lg:col-span-7 w-full bg-white/50 lg:bg-background rounded-[3rem] p-4 lg:p-8 flex flex-col items-center justify-center border-4 border-white shadow-inner min-h-[450px] lg:min-h-[700px] relative overflow-hidden group/preview">
            <div className={`transition-all duration-700 ease-out transform group-hover/preview:scale-[1.01] z-10
                ${printFormat === 'A4' ? 'scale-[0.3] xs:scale-[0.4] sm:scale-[0.45]' :
                  printFormat === 'A5' ? 'scale-[0.4] xs:scale-[0.5] sm:scale-[0.6]' :
                  'scale-[0.7] xs:scale-[0.85] sm:scale-100'}`}>

                <div id="printable-area" className={`relative transition-all duration-700 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)]
                    ${printFormat === 'A4' ? 'w-[794px] h-[1123px]' : printFormat === 'A5' ? 'w-[561px] h-[794px]' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'classic' ? 'bg-brand text-white border-none' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'modern' ? 'bg-[#fffcf0] text-zinc-800 border-none' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'luxury' ? 'bg-white text-zinc-900 border-[24px] border-gold outline-[1px] outline-dashed outline-gold outline-offset-[-12px]' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'midnight' ? 'bg-[#09090b] text-white border-none' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'rustic' ? 'bg-[#f5f5f4] text-[#44403c] border-[16px] border-[#d6d3d1]' : ''}
                    ${printFormat !== 'QR' && posterTemplate === 'ocean' ? 'bg-[#0c4a6e] text-white border-none' : ''}
                    ${printFormat === 'QR' ? 'contents' : 'flex flex-col items-center justify-between'}
                    ${printFormat === 'A4' ? 'py-24 px-16' : printFormat === 'A5' ? 'py-16 px-10' : ''}
                `}>
                    {printFormat !== 'QR' && (
                        <div className="text-center w-full animate-in fade-in duration-1000">
                            <div className={`mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl
                                ${posterTemplate === 'classic' ? 'bg-gold text-brand' : ''}
                                ${posterTemplate === 'modern' ? 'bg-brand text-white' : ''}
                                ${posterTemplate === 'luxury' ? 'bg-brand text-white' : ''}
                                ${posterTemplate === 'midnight' ? 'bg-gold text-[#09090b]' : ''}
                                ${posterTemplate === 'rustic' ? 'bg-[#44403c] text-[#f5f5f4]' : ''}
                                ${posterTemplate === 'ocean' ? 'bg-gold text-[#0c4a6e]' : ''}
                                ${printFormat === 'A4' ? 'w-24 h-24 mb-10' : 'w-16 h-16 mb-6'}
                            `}><ChefHat className={printFormat === 'A4' ? 'w-14 h-14' : 'w-10 h-10'} /></div>
                            <h3 className={`font-bold tracking-tight italic ${posterTemplate === 'modern' ? 'font-sans uppercase tracking-[0.1em] text-zinc-900' : 'font-serif'} ${posterTemplate === 'luxury' ? 'text-gold underline decoration-gold/20 underline-offset-8' : ''} ${posterTemplate === 'classic' ? 'text-white underline decoration-gold/30 underline-offset-8' : ''} ${posterTemplate === 'midnight' ? '!text-white underline decoration-gold/20 underline-offset-8' : ''} ${posterTemplate === 'rustic' ? 'text-[#44403c]' : ''} ${posterTemplate === 'ocean' ? '!text-white' : ''} ${printFormat === 'A4' ? 'text-7xl mb-4' : 'text-5xl mb-2'}`}>{restaurantName || 'NOUR'}</h3>
                            <p className={`font-black tracking-[0.6em] uppercase ${posterTemplate === 'classic' ? 'text-emerald-100/60' : ''} ${posterTemplate === 'modern' ? 'text-zinc-400' : ''} ${posterTemplate === 'luxury' ? 'text-zinc-400' : ''} ${posterTemplate === 'midnight' ? 'text-zinc-500' : ''} ${posterTemplate === 'rustic' ? 'text-[#78716c]' : ''} ${posterTemplate === 'ocean' ? 'text-sky-200/60' : ''} ${printFormat === 'A4' ? 'text-[14px] mt-6' : 'text-[10px] mt-4'}`}>Expérience Menu Digital</p>
                        </div>
                    )}
                    <div id="qr-card-to-capture" className={`relative transition-all duration-700 flex flex-col items-center justify-center ${printFormat === 'QR' && qrStyle === 'simple' ? 'bg-white p-12 shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5' : ''} ${printFormat === 'QR' && qrStyle === 'rounded' ? 'bg-white p-12 rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5' : ''} ${printFormat === 'QR' && qrStyle === 'card' ? 'bg-white p-12 pb-20 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-black/5 min-w-[440px]' : ''} ${printFormat === 'QR' && qrStyle === 'frame' ? 'bg-brand-dark p-16 pb-24 rounded-[6rem] shadow-[0_70px_140px_rgba(0,0,0,0.2)] border-[12px] border-brand/20' : ''} ${printFormat !== 'QR' ? 'my-auto bg-white shadow-2xl transition-all' : ''} ${printFormat === 'A4' ? 'p-10 rounded-[4rem] scale-[1.4]' : printFormat === 'A5' ? 'p-6 rounded-[3rem] scale-[1.1]' : ''}`}>
                        {qrMode === 'tables' && (
                            <div className="mb-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-6 bg-gold/40"></div>
                                    <span className="text-[14px] font-black text-brand uppercase tracking-[0.3em]">Table</span>
                                    <div className="h-[1px] w-6 bg-gold/40"></div>
                                </div>
                                <span className="text-5xl font-serif font-bold text-brand mt-1">{tableNumber}</span>
                            </div>
                        )}
                        <div className={`overflow-hidden transition-all duration-700 ${printFormat === 'QR' && qrStyle === 'frame' ? 'p-6 bg-white rounded-[3.5rem] shadow-2xl' : ''} ${printFormat === 'QR' && qrStyle === 'rounded' ? 'rounded-[3.5rem]' : ''} ${printFormat !== 'QR' ? 'rounded-[2.5rem]' : ''} relative`} ref={qrRef}>
                        </div>
                    </div>
                    {printFormat !== 'QR' && (
                        <div className={`text-center w-full ${printFormat === 'A4' ? 'space-y-4' : 'space-y-2'}`}><p className={`font-serif font-bold italic tracking-wide ${printFormat === 'A4' ? 'text-2xl' : 'text-xl'}`}>Scannez pour découvrir notre carte</p><div className="flex items-center justify-center gap-3"><div className={`h-px w-8 ${posterTemplate === 'classic' ? 'bg-emerald-100/20' : ''} ${posterTemplate === 'midnight' ? 'bg-zinc-800' : ''} ${posterTemplate === 'rustic' ? 'bg-stone-300' : ''} ${posterTemplate === 'ocean' ? 'bg-sky-900/40' : 'bg-zinc-200'}`}></div><p className={`font-black tracking-[0.3em] uppercase ${posterTemplate === 'classic' ? 'text-emerald-100/40' : ''} ${posterTemplate === 'midnight' ? 'text-zinc-600' : ''} ${posterTemplate === 'rustic' ? 'text-stone-400' : ''} ${posterTemplate === 'ocean' ? 'text-sky-300/40' : 'text-zinc-400'} ${printFormat === 'A4' ? 'text-[10px]' : 'text-[8px]'}`}>noremenu.com</p><div className={`h-px w-8 ${posterTemplate === 'classic' ? 'bg-emerald-100/20' : ''} ${posterTemplate === 'midnight' ? 'bg-zinc-800' : ''} ${posterTemplate === 'rustic' ? 'bg-stone-300' : ''} ${posterTemplate === 'ocean' ? 'bg-sky-900/40' : 'bg-zinc-200'}`}></div></div></div>
                    )}
                </div>
            </div>
        </div>
    )
}
