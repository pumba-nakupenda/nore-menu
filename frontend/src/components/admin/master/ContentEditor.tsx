'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
    Layout,
    Smartphone,
    Workflow,
    CreditCard,
    Upload,
    Loader2
} from 'lucide-react'

function Input({ label, value, onChange }: { label: string, value: any, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-[0.1em]">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 ring-brand/5 transition-all" />
        </div>
    )
}

function Textarea({ label, value, onChange }: { label: string, value: any, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-[0.1em]">{label}</label>
            <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 ring-brand/5 transition-all" />
        </div>
    )
}

interface ContentEditorProps {
    saving: boolean
    siteContent: any
    setSiteContent: (v: any) => void
    uploadingIdx: string | number | null
    handleSaveContent: (section: string) => void
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void, identifier: string | number) => void
}

export default function ContentEditor({ saving, siteContent, setSiteContent, uploadingIdx, handleSaveContent, handleFileUpload }: ContentEditorProps) {
    return (
        <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* HERO SECTION */}
            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Layout className="w-6 h-6 text-[#b48a4d]" /> 1. Section Hero</h2>
                    <button disabled={saving} onClick={() => handleSaveContent('hero')} className="px-8 py-3 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase">Publier</button>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Input label="Titre Principal" value={siteContent.hero?.title} onChange={(v: string) => setSiteContent({...siteContent, hero: {...siteContent.hero, title: v}})} />
                        <Textarea label="Description" value={siteContent.hero?.subtitle} onChange={(v: string) => setSiteContent({...siteContent, hero: {...siteContent.hero, subtitle: v}})} />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image Hero (URL/Upload)</label>
                        <div className="flex gap-4">
                            <input type="text" value={siteContent.hero?.image_url} onChange={(e) => setSiteContent({...siteContent, hero: {...siteContent.hero, image_url: e.target.value}})} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs outline-none" />
                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                {uploadingIdx === 'hero' ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero', (url) => setSiteContent({...siteContent, hero: {...siteContent.hero, image_url: url}}), 'hero')} />
                            </label>
                        </div>
                        <div className="aspect-video relative rounded-3xl overflow-hidden border border-zinc-100">
                            {siteContent.hero?.image_url && <Image src={siteContent.hero.image_url} alt="Hero" fill className="object-cover" unoptimized />}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION SOLUTION SECTION */}
            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Smartphone className="w-6 h-6 text-[#b48a4d]" /> 2. Section Solution (Écosystème)</h2>
                    <button disabled={saving} onClick={() => handleSaveContent('solution')} className="px-8 py-3 bg-brand text-white rounded-full text-[10px] font-black uppercase">Publier Solution</button>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Input label="Titre Solution" value={siteContent.solution?.title} onChange={(v: string) => setSiteContent({...siteContent, solution: {...siteContent.solution, title: v}})} />
                        <Textarea label="Description Solution" value={siteContent.solution?.description} onChange={(v: string) => setSiteContent({...siteContent, solution: {...siteContent.solution, description: v}})} />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Image Solution</label>
                        <div className="flex gap-4">
                            <input type="text" value={siteContent.solution?.image_url} onChange={(e) => setSiteContent({...siteContent, solution: {...siteContent.solution, image_url: e.target.value}})} className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs outline-none" />
                            <label className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl cursor-pointer flex items-center justify-center">
                                {uploadingIdx === 'sol' ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : <Upload className="w-5 h-5 text-zinc-500" />}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'solution', (url) => setSiteContent({...siteContent, solution: {...siteContent.solution, image_url: url}}), 'sol')} />
                            </label>
                        </div>
                        <div className="aspect-video relative rounded-3xl overflow-hidden border border-zinc-100">
                            {siteContent.solution?.image_url && <Image src={siteContent.solution.image_url} alt="Sol" fill className="object-cover" unoptimized />}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION VOYAGE (FLOW) */}
            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><Workflow className="w-6 h-6 text-[#b48a4d]" /> 3. Section Voyage (Le Flux)</h2>
                    <button disabled={saving} onClick={() => handleSaveContent('flow')} className="px-8 py-3 bg-brand text-white rounded-full text-[10px] font-black uppercase">Publier Voyage</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[0, 1, 2].map((idx) => {
                        const step = siteContent.flow?.steps?.[idx] || { n: `0${idx+1}`, t: "", d: "", img: "" };
                        return (
                            <div key={idx} className="p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-4">
                                <Input label={`Étape ${step.n} - Titre`} value={step.t} onChange={(v) => {
                                    const steps = [...(siteContent.flow?.steps || [])];
                                    steps[idx] = { ...step, t: v };
                                    setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                }} />
                                <Textarea label="Description" value={step.d} onChange={(v) => {
                                    const steps = [...(siteContent.flow?.steps || [])];
                                    steps[idx] = { ...step, d: v };
                                    setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                }} />
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="URL Image" value={step.img} onChange={(e) => {
                                            const steps = [...(siteContent.flow?.steps || [])];
                                            steps[idx] = { ...step, img: e.target.value };
                                            setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                        }} className="flex-1 p-3 bg-white border border-zinc-200 rounded-xl text-[10px] outline-none" />
                                        <label className="p-3 bg-white border border-zinc-200 rounded-xl cursor-pointer">
                                            {uploadingIdx === `flow-${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'flow', (url) => {
                                                const steps = [...(siteContent.flow?.steps || [])];
                                                steps[idx] = { ...step, img: url };
                                                setSiteContent({ ...siteContent, flow: { ...siteContent.flow, steps } });
                                            }, `flow-${idx}`)} />
                                        </label>
                                    </div>
                                    <div className="aspect-video relative rounded-2xl overflow-hidden border border-zinc-200">
                                        {step.img && <Image src={step.img} alt="Step" fill className="object-cover" unoptimized />}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* SECTION TARIFS (PRICING) */}
            <section className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-50 pb-8">
                    <h2 className="text-2xl font-serif font-bold italic flex items-center gap-3"><CreditCard className="w-6 h-6 text-[#b48a4d]" /> 4. Section Tarification</h2>
                    <button disabled={saving} onClick={() => handleSaveContent('pricing')} className="px-8 py-3 bg-[#b48a4d] text-white rounded-full text-[10px] font-black uppercase">Publier Tarifs</button>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[0, 1, 2].map((idx) => {
                        const plan = siteContent.pricing?.plans?.[idx] || { t: "", p: "", f: [] };
                        return (
                            <div key={idx} className="p-8 bg-zinc-50 rounded-[3rem] border border-zinc-100 space-y-4">
                                <Input label="Nom du Forfait" value={plan.t} onChange={(v) => {
                                    const plans = [...(siteContent.pricing?.plans || [])];
                                    plans[idx] = { ...plan, t: v };
                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                }} />
                                <Input label="Prix (ex: 15.000 FCFA)" value={plan.p} onChange={(v) => {
                                    const plans = [...(siteContent.pricing?.plans || [])];
                                    plans[idx] = { ...plan, p: v };
                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                }} />
                                <Textarea label="Fonctionnalités (1 par ligne)" value={plan.f?.join('\n')} onChange={(v) => {
                                    const plans = [...(siteContent.pricing?.plans || [])];
                                    plans[idx] = { ...plan, f: v.split('\n') };
                                    setSiteContent({ ...siteContent, pricing: { ...siteContent.pricing, plans } });
                                }} />
                            </div>
                        )
                    })}
                </div>
            </section>
        </motion.div>
    )
}
