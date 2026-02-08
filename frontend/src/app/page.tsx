'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { ArrowRight, QrCode, Smartphone, ChefHat, ScanLine, UtensilsCrossed, Sparkles, Check, PlayCircle, Star, Users, Globe, Zap, HelpCircle, Plus, Minus, Palette, Printer, ShoppingBag, CreditCard, Truck, ShieldCheck, Cpu, X, MessageCircle, Coins, Utensils, LayoutDashboard, ChevronRight, Bike, Monitor, Gem, Crown, Coffee, Compass, BarChart3, Clock, Layers } from 'lucide-react'
import Magnetic from '@/components/Magnetic'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [siteContent, setSiteContent] = useState<any>(null)
  const [hardwareItems, setHardwareItems] = useState<any[]>([])
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Theme Transitions
  const bgColor = useTransform(scrollYProgress, [0, 0.38, 0.42, 0.68, 0.72, 0.88, 0.92, 1], ["#fdfcfb", "#fdfcfb", "#064e3b", "#064e3b", "#09090b", "#09090b", "#fdfcfb", "#fdfcfb"])
  const textColor = useTransform(scrollYProgress, [0, 0.38, 0.42, 0.68, 0.72, 0.88, 0.92, 1], ["#111827", "#111827", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#111827", "#111827"])
  const borderColor = useTransform(scrollYProgress, [0, 0.38, 0.42, 0.68, 0.72, 0.88, 0.92, 1], ["rgba(17, 24, 39, 0.15)", "rgba(17, 24, 39, 0.15)", "rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.15)", "rgba(17, 24, 39, 0.15)", "rgba(17, 24, 39, 0.15)"])
  const headerBg = useTransform(scrollYProgress, [0, 0.38, 0.42, 0.68, 0.72, 0.88, 0.92, 1], ["rgba(253, 252, 251, 0.7)", "rgba(253, 252, 251, 0.7)", "rgba(6, 78, 59, 0.7)", "rgba(6, 78, 59, 0.7)", "rgba(9, 9, 11, 0.7)", "rgba(9, 9, 11, 0.7)", "rgba(253, 252, 251, 0.7)", "rgba(253, 252, 251, 0.7)"])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cursorSpringX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 })
  const cursorSpringY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)
      
      const { data: cData } = await supabase.from('site_content').select('*')
      if (cData) setSiteContent(cData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}))

      const { data: hData } = await supabase.from('hardware_products').select('*').eq('is_active', true).limit(2).order('created_at', { ascending: false })
      if (hData) setHardwareItems(hData)
    }
    fetchData()
  }, [])

  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: horizontalProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] })
  const x = useTransform(horizontalProgress, [0, 1], ["0%", "-240vw"])

  // Robust Default Values
  const hero = {
    title: siteContent?.hero?.title || "Digitalisez L'Excellence",
    subtitle: siteContent?.hero?.subtitle || "Système complet de Commande WhatsApp & POS pour les restaurants premium.",
    image_url: siteContent?.hero?.image_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"
  }

  const solution = {
    title: siteContent?.solution?.title || "Un écosystème \nsans failles.",
    description: siteContent?.solution?.description || "Nore Menu résout la lenteur du service et les erreurs de commande.",
    image_url: siteContent?.solution?.image_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"
  }

  const flow = {
    title: siteContent?.flow?.title || "Le Flux",
    steps: siteContent?.flow?.steps || [
      { n: "01", t: "Commande", d: "Scan & WhatsApp", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974" },
      { n: "02", t: "Validation", d: "Sur POS", img: "https://images.unsplash.com/photo-1526367790999-0150786486a9?q=80&w=2070" },
      { n: "03", t: "Cuisine", d: "Écran KDS", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1954" },
      { n: "04", t: "Data", d: "Stats réelles", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070" }
    ]
  }

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor, color: textColor }} className="min-h-screen flex flex-col font-sans selection:bg-[#b48a4d]/30 transition-colors duration-700 relative">
      <motion.div className="fixed top-0 left-0 w-4 h-4 bg-[#b48a4d] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden lg:block" style={{ x: cursorSpringX, y: cursorSpringY, translateX: "-50%", translateY: "-50%" }} />

      <motion.header style={{ backgroundColor: headerBg, borderBottomColor: borderColor }} className="fixed top-0 w-full z-[100] h-20 backdrop-blur-xl border-b transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Magnetic><div className="flex items-center gap-2.5 group cursor-pointer"><div className="bg-[#064e3b] text-white p-2 rounded-xl shadow-lg"><ChefHat className="w-5 h-5" /></div><span className="text-xl font-serif font-bold tracking-tight">Nore Menu</span></div></Magnetic>
          <nav className="hidden lg:flex items-center gap-12">
            {['Solution', 'Fonctionnement', 'Tarifs'].map(item => (<Magnetic key={item}><Link href={`#${item === 'Solution' ? 'solution' : item === 'Fonctionnement' ? 'fonctionnement' : 'tarifs'}`} className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 hover:opacity-100">{item}</Link></Magnetic>))}
            <Magnetic><Link href="/shop" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b48a4d] flex items-center gap-2 hover:gap-3 transition-all">Boutique <ShoppingBag className="w-3 h-3" /></Link></Magnetic>
          </nav>
          <div className="flex items-center gap-8">
            {!user ? (<><Magnetic><Link href="/login" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hidden sm:block">Sign In</Link></Magnetic><Magnetic><Link href="/login" className="px-8 py-2.5 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2 group"><span className="mix-blend-difference text-white">Sign Up</span><ArrowRight className="w-3 h-3 mix-blend-difference text-white group-hover:translate-x-1" /></Link></Magnetic></>) : (<Magnetic><Link href="/admin/menu" className="px-8 py-2.5 bg-[#064e3b] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#053e2f] transition-all shadow-xl flex items-center gap-2 group">Tableau de bord<ArrowRight className="w-3 h-3 group-hover:translate-x-1" /></Link></Magnetic>)}
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} className="text-center z-10 px-6">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-3 px-5 py-2 border border-current opacity-30 rounded-full bg-white/5 backdrop-blur-sm"><Zap className="w-3 h-3 animate-pulse text-[#b48a4d]" /><span className="text-[8px] font-black uppercase tracking-[0.5em]">The Imperial Standard</span></div>
              <h1 className="text-[8vw] lg:text-[10vw] font-serif font-bold leading-[0.75] tracking-tighter uppercase relative">
                {hero.title.split('\n').map((t: string, i: number) => (<span key={i}>{i === 1 ? <span className="italic text-[#b48a4d]">{t}</span> : t}<br /></span>))}
              </h1>
              <div className="flex flex-col items-center gap-8">
                <p className="text-xl md:text-2xl max-w-2xl opacity-70 font-medium leading-relaxed">{hero.subtitle}</p>
                <div className="flex gap-6"><Link href="/login" className="px-10 py-5 bg-[#064e3b] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Démarrer maintenant</Link><Link href="#solution" className="px-10 py-5 border border-current rounded-full text-xs font-black uppercase tracking-widest hover:bg-current hover:text-white transition-all">Découvrir</Link></div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="solution" className="py-60 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <motion.div initial={{ clipPath: 'inset(100% 0 0 0)' }} whileInView={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 1.5 }} className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
              <Image src={solution.image_url} alt="Service" fill className="object-cover" /><div className="absolute inset-0 bg-[#064e3b]/30 mix-blend-multiply"></div>
            </motion.div>
            <div className="space-y-16">
              <h2 className="text-6xl md:text-8xl font-serif font-bold leading-tight uppercase">{solution.title.split('\n').map((t: string, i: number) => (<span key={i}>{i === 1 ? <span className="text-[#b48a4d] italic">{t}</span> : t}<br /></span>))}</h2>
              <p className="text-xl opacity-70 italic leading-relaxed">{solution.description}</p>
              <div className="space-y-12">
                {[ { t: "Vendez Plus", d: "Menu digital interactif.", i: <BarChart3 /> }, { t: "Servez plus Vite", d: "Commandes instantanées.", i: <Clock /> }, { t: "Gérez Tout", d: "POS moderne.", i: <Layers /> } ].map((item, i) => (
                  <motion.div key={item.t} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="group">
                    <div className="flex items-center gap-4 mb-2"><span className="text-[#b48a4d] opacity-50 group-hover:opacity-100">{item.i}</span><h3 className="text-3xl font-serif font-bold group-hover:text-[#b48a4d] transition-colors">{item.t}</h3></div>
                    <p className="text-lg opacity-70 ml-9">{item.d}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnement" ref={targetRef} className="relative h-[600vh] bg-transparent">
          <div className="sticky top-0 h-screen flex items-center overflow-hidden">
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1 bg-current opacity-10 rounded-full z-20"><motion.div style={{ scaleX: horizontalProgress }} className="h-full bg-[#b48a4d] origin-left rounded-full" /></div>
            <motion.div style={{ x }} className="flex flex-nowrap gap-[10vw] px-[10vw]">
              <div className="w-[80vw] lg:w-[40vw] flex-shrink-0 flex flex-col justify-center"><h2 className="text-[10vw] font-serif font-bold leading-none uppercase mb-10">{flow.title}</h2><p className="text-2xl opacity-70 max-w-md italic font-medium">L'expérience Nore en 4 étapes fluides.</p></div>
              {flow.steps.map((step: any) => (
                <div key={step.n} className="w-[80vw] lg:w-[60vw] flex-shrink-0 flex flex-col justify-center relative">
                   <div className="relative h-[60vh] rounded-[4rem] overflow-hidden group border border-current/20 z-10 shadow-2xl"><Image src={step.img} alt={step.t} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" /><div className="absolute inset-0 bg-black/60 p-16 flex flex-col justify-end"><span className="text-7xl font-serif italic text-[#b48a4d] mb-4">{step.n}</span><h4 className="text-5xl font-serif font-bold text-white mb-4">{step.t}</h4><p className="text-xl text-white/80 max-w-sm">{step.d}</p></div></div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="shop" className="py-60 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-10"><div className="max-w-2xl"><h2 className="text-6xl md:text-8xl font-serif font-bold leading-tight uppercase">Hardware<br /><span className="text-[#b48a4d] italic">Signature</span></h2></div><p className="text-xl opacity-70 max-w-sm italic mb-4">Découvrez nos supports physiques réels.</p></div>
            <div className="grid md:grid-cols-2 gap-20">
              {hardwareItems.map((item: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="group">
                  <div className="aspect-[16/10] relative rounded-[3rem] overflow-hidden mb-10 shadow-2xl border border-current/10"><Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-all duration-1000" /></div>
                  <div className="flex justify-between items-start px-4"><div><h3 className="text-2xl font-serif font-bold mb-2">{item.title}</h3><p className="opacity-70 text-sm font-medium">{item.price?.toLocaleString()} FCFA</p></div><Link href="/shop" className="p-4 border border-current rounded-full hover:bg-[#b48a4d] hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></Link></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="tarifs" className="py-60 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center mb-40 relative z-10"><h2 className="text-7xl md:text-9xl font-serif font-bold uppercase tracking-tighter mb-10">L'Investissement</h2><p className="text-xl opacity-70 italic">Le standard adapté à votre ambition.</p></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12 relative z-10">
            {[ { t: "Essentiel", p: "Gratuit", f: ["Menu 20 Plats", "QR Code Standard"] }, { t: "Signature", p: "15k", f: ["Illimité", "Caisse POS", "Écran Cuisine KDS"] }, { t: "Héritage", p: "Sur Devis", f: ["Multi-sites", "Marque Blanche"] } ].map((plan, i) => (
              <motion.div key={plan.t} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className={`p-16 rounded-[4rem] bg-white/5 border border-current/20 flex flex-col gap-12 relative overflow-hidden ${i === 1 ? 'bg-[#b48a4d] text-zinc-950 shadow-2xl border-none' : ''}`} ><h3 className="text-3xl font-serif font-bold">{plan.t}</h3><div className="text-7xl font-serif font-bold">{plan.p}</div><ul className="space-y-6 flex-1 opacity-90">{plan.f.map(f => (<li key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-current" /> {f}</li>))}</ul><Magnetic><Link href="/login" className={`w-full py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest text-center ${i === 1 ? 'bg-zinc-950 text-white' : 'bg-current text-white mix-blend-difference'}`}>Démarrer</Link></Magnetic></motion.div>
            ))}
          </div>
        </section>
      </main>

      <motion.footer style={{ borderTopColor: borderColor }} className="py-40 px-6 border-t relative z-30 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="font-serif font-bold text-3xl tracking-tighter">Nore Menu</div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Dakar &copy; {new Date().getFullYear()}</div>
          <div className="flex gap-12">{['Confidentialité', 'CGU', 'Instagram'].map(item => (
            <Magnetic key={item}><Link href="#" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#b48a4d] transition-colors">{item}</Link></Magnetic>
          ))}</div>
        </div>
      </motion.footer>
    </motion.div>
  )
}