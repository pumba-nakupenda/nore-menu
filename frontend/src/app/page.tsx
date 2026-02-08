'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
    ArrowRight, 
    ChefHat, 
    Zap, 
    Check, 
    ShoppingBag, 
    ChevronRight, 
    BarChart3, 
    Clock, 
    Layers, 
    Smartphone, 
    ShieldCheck, 
    Globe,
    MessageCircle
} from 'lucide-react'
import Magnetic from '@/components/Magnetic'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [siteContent, setSiteContent] = useState<any>(null)
  const [hardwareItems, setHardwareItems] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)
      
      const { data: cData } = await supabase.from('site_content').select('*')
      if (cData) setSiteContent(cData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}))

      const { data: hData } = await supabase.from('hardware_products').select('*').eq('is_active', true).limit(3).order('created_at', { ascending: false })
      if (hData) setHardwareItems(hData)
    }
    fetchData()
  }, [])

  // Dynamic Content with Robust Fallbacks
  const hero = {
    title: siteContent?.hero?.title || "Digitalisez\nL'Excellence",
    subtitle: siteContent?.hero?.subtitle || "Le système de commande WhatsApp & POS conçu pour les établissements premium.",
    image_url: siteContent?.hero?.image_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"
  }

  const solution = {
    title: siteContent?.solution?.title || "Un écosystème sans failles.",
    description: siteContent?.solution?.description || "Optimisez chaque aspect de votre service, de la prise de commande à la gestion des stocks.",
    image_url: siteContent?.solution?.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974"
  }

  const flowSteps = siteContent?.flow?.steps || [
    { n: "01", t: "Commande", d: "Le client scanne et commande sur WhatsApp.", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974" },
    { n: "02", t: "Validation", d: "Le serveur valide instantanément sur le POS.", img: "https://images.unsplash.com/photo-1526367790999-0150786486a9?q=80&w=2070" },
    { n: "03", t: "Cuisine", d: "La commande s'affiche sur l'écran KDS.", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1954" }
  ]

  const pricingPlans = siteContent?.pricing?.plans || [
    { t: "Essentiel", p: "Gratuit", f: ["Menu 20 Plats", "QR Code Standard", "Commandes WhatsApp"] },
    { t: "Signature", p: "15.000 FCFA", f: ["Plats Illimités", "Logiciel de Caisse POS", "Gestion de Stock", "Support 24/7"] },
    { t: "Héritage", p: "Sur Devis", f: ["Multi-établissements", "Marque Blanche", "API Intégration", "Account Manager"] }
  ]

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-zinc-900 font-sans selection:bg-[#064e3b]/10">
      
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#064e3b] text-white p-2 rounded-xl shadow-lg">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">Nore Menu</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            {['Solution', 'Fonctionnement', 'Tarifs'].map((item: string) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#064e3b] transition-colors">{item}</Link>
            ))}
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-[#b48a4d] flex items-center gap-2">Boutique <ShoppingBag className="w-3 h-3" /></Link>
          </nav>
          <div className="flex items-center gap-4">
            {!user ? (
              <Link href="/login" className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 group">
                Démarrer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link href="/admin/menu" className="px-6 py-2.5 bg-[#064e3b] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Tableau de Bord</Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <Zap className="w-3 h-3 text-[#b48a4d]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">L'Allié des Restaurants Premium</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] tracking-tighter uppercase">
                {hero.title.split('\n').map((t: string, i: number) => (
                  <span key={i} className="block">{i === 1 ? <span className="text-[#b48a4d] italic">{t}</span> : t}</span>
                ))}
              </h1>
              <p className="text-xl text-zinc-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                {hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login" className="px-10 py-5 bg-[#064e3b] text-white rounded-2xl font-bold shadow-2xl hover:scale-105 transition-transform text-center">Essayer Gratuitement</Link>
                <Link href="#solution" className="px-10 py-5 border border-zinc-200 rounded-2xl font-bold hover:bg-zinc-50 transition-all text-center">Voir la démo</Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative aspect-square rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white">
              <Image src={hero.image_url} alt="Nore Menu Hero" fill className="object-cover" priority unoptimized />
            </motion.div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section id="solution" className="py-32 bg-zinc-50 px-6">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-6">{solution.title}</h2>
              <p className="text-xl text-zinc-500 font-medium">{solution.description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Ventes Boostées", d: "Un menu digital interactif qui suggère intelligemment des suppléments.", i: <BarChart3 className="w-6 h-6" /> },
                { t: "Service Rapide", d: "Les commandes arrivent instantanément en cuisine sans erreur.", i: <Clock className="w-6 h-6" /> },
                { t: "Contrôle Total", d: "Pilotez vos stocks, votre personnel et vos ventes en temps réel.", i: <Layers className="w-6 h-6" /> }
              ].map((item: any, i: number) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#064e3b]">{item.i}</div>
                  <h3 className="text-2xl font-serif font-bold">{item.t}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{item.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (FLUX) */}
        <section id="fonctionnement" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-serif font-bold uppercase text-center mb-24">Le Voyage Nore</h2>
            <div className="space-y-12">
              {flowSteps.map((step: any, i: number) => (
                <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
                  <div className="flex-1 space-y-6">
                    <span className="text-6xl font-serif italic text-[#b48a4d] opacity-30">{step.n}</span>
                    <h3 className="text-4xl font-serif font-bold">{step.t}</h3>
                    <p className="text-xl text-zinc-500 font-medium leading-relaxed">{step.d}</p>
                  </div>
                  <div className="flex-1 relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                    <Image src={step.img || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974"} alt={step.t} fill className="object-cover" unoptimized />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HARDWARE PREVIEW */}
        <section className="py-32 bg-[#064e3b] text-white px-6 rounded-[4rem] mx-4 mb-32">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
            <div className="max-w-xl">
              <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase leading-[0.9]">Hardware<br/><span className="text-[#b48a4d] italic text-4xl md:text-6xl">Signature</span></h2>
            </div>
            <p className="text-xl text-emerald-100/60 font-medium max-w-sm">Découvrez nos supports physiques conçus pour durer et sublimer vos tables.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {hardwareItems.map((item: any, i: number) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/5] relative rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" unoptimized />
                </div>
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-xl font-serif font-bold">{item.title}</h4>
                  <Link href="/shop" className="p-3 bg-white/10 rounded-full hover:bg-[#b48a4d] transition-colors"><ChevronRight className="w-4 h-4" /></Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tight">L'Investissement</h2>
              <p className="text-xl text-zinc-500 font-medium italic">Le standard adapté à votre ambition.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {pricingPlans.map((plan: any, i: number) => (
                <div key={i} className={`p-12 rounded-[3.5rem] border ${i === 1 ? 'bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-emerald-100 scale-105 relative z-10' : 'bg-zinc-50 border-zinc-100'} space-y-10`}>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold">{plan.t}</h3>
                    <div className="text-5xl font-serif font-bold text-[#064e3b]">{plan.p}</div>
                  </div>
                  <ul className="space-y-4">
                    {plan.f.map((feature: string, j: number) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                        <Check className="w-4 h-4 text-[#b48a4d]" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className={`block w-full py-5 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest transition-all ${i === 1 ? 'bg-[#064e3b] text-white shadow-xl shadow-emerald-900/20' : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'}`}>Sélectionner</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-900 text-white py-24 px-6 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-[#b48a4d]" />
              <span className="text-3xl font-serif font-bold tracking-tighter">Nore Menu</span>
            </div>
            <p className="text-zinc-400 max-w-sm text-lg font-medium leading-relaxed">Redéfinir l'expérience culinaire à travers l'innovation digitale et l'esthétique premium.</p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Plateforme</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-300">
              <li><Link href="#solution" className="hover:text-[#b48a4d] transition-colors">Solution</Link></li>
              <li><Link href="/shop" className="hover:text-[#b48a4d] transition-colors">Hardware</Link></li>
              <li><Link href="/login" className="hover:text-[#b48a4d] transition-colors">Connexion</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-300">
              <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Support</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> Dakar, Sénégal</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Nore Menu. Signature Digital Excellence.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}