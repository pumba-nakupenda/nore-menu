'use client'

import Link from 'next/link'
import { ArrowLeft, ChefHat, ShieldCheck, Eye, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fdfcfb] text-zinc-900 font-sans">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#064e3b] text-white p-2 rounded-xl shadow-lg">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-[#064e3b]">Nore Menu</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-4 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#064e3b] rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Confidentialité</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Politique de Confidentialité</h1>
          <p className="text-zinc-500 font-medium">Dernière mise à jour : 6 Février 2026</p>
        </div>

        <div className="prose prose-zinc prose-lg max-w-none space-y-12 text-zinc-600 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">1. Collecte des données</h2>
            <p>
              Nous collectons les données nécessaires au fonctionnement de votre compte restaurateur : nom de l'établissement, adresse email, mot de passe (crypté) et numéro de téléphone WhatsApp. Pour les clients finaux des restaurants, nous collectons des données anonymisées de consultation (nombre de vues par plat) afin de fournir des analytics au restaurateur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">2. Utilisation des données</h2>
            <p>
              Vos données sont exclusivement utilisées pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gérer votre abonnement et l'accès à la plateforme.</li>
              <li>Personnaliser l'affichage de votre menu digital.</li>
              <li>Vous envoyer des rapports de performance hebdomadaires.</li>
              <li>Assurer le support technique via WhatsApp.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">3. Conservation des données</h2>
            <p>
              Nous conservons vos données tant que votre compte est actif. En cas de suppression de compte via l'onglet "Account", toutes les données associées au restaurant, aux catégories et aux plats sont supprimées de nos serveurs de manière permanente dans un délai de 30 jours.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">4. Cookies</h2>
            <p>
              Nous utilisons des cookies techniques essentiels pour maintenir votre session de connexion active et mémoriser vos préférences de langue. Aucun cookie publicitaire tiers n'est déposé par Nore Menu.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">5. Sécurité</h2>
            <p>
              Toutes les données sont stockées sur des infrastructures sécurisées fournies par Supabase (certifiées conformes aux standards de sécurité internationaux). Les échanges sont systématiquement cryptés via le protocole HTTPS.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-[#053e2f] py-12 px-6 text-center border-t border-white/5">
        <p className="text-emerald-100/40 text-xs tracking-widest uppercase font-bold">&copy; 2026 Nore Menu Premium - Votre vie privée, notre priorité</p>
      </footer>
    </div>
  )
}
