'use client'

import Link from 'next/link'
import { ArrowLeft, ChefHat, ShieldCheck, Scale, FileText } from 'lucide-react'

export default function TermsPage() {
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
            <Scale className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Juridique</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Conditions Générales d'Utilisation</h1>
          <p className="text-zinc-500 font-medium">Dernière mise à jour : 6 Février 2026</p>
        </div>

        <div className="prose prose-zinc prose-lg max-w-none space-y-12 text-zinc-600 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">1. Objet du Service</h2>
            <p>
              Nore Menu fournit une plateforme SaaS permettant aux restaurateurs de créer, gérer et diffuser des menus numériques via QR Code et technologie NFC. Le service inclut des outils d'analyse de données, de personnalisation graphique et de facilitation de commande via WhatsApp.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">2. Abonnement et Paiement</h2>
            <p>
              L'accès aux fonctionnalités "Signature" et "Héritage" est soumis à un abonnement payant. Les tarifs sont indiqués en FCFA (ou devise choisie) et sont payables d'avance par les moyens de paiement proposés sur la plateforme. Nore Menu se réserve le droit de modifier ses tarifs à tout moment, tout en maintenant le tarif en vigueur pour la période d'abonnement déjà réglée.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">3. Responsabilité du Contenu</h2>
            <p>
              Le restaurateur est seul responsable des informations publiées sur son menu (prix, descriptions, allergènes, images). Nore Menu ne saurait être tenu responsable en cas d'erreur sur les tarifs ou de litige commercial entre le restaurant et ses clients finaux.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">4. Utilisation de WhatsApp</h2>
            <p>
              Le service de commande utilise l'API publique de WhatsApp. Nore Menu n'est pas affilié à WhatsApp Inc. Le bon fonctionnement de cette fonctionnalité dépend de la disponibilité des services tiers et de la configuration du numéro de téléphone par le restaurateur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900">5. Propriété Intellectuelle</h2>
            <p>
              Tous les éléments de la plateforme (code, design, logos de Nore Menu) sont la propriété exclusive de Nore Menu. Le restaurateur conserve la propriété de ses propres données (logo du restaurant, photos des plats).
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-[#053e2f] py-12 px-6 text-center border-t border-white/5">
        <p className="text-emerald-100/40 text-xs tracking-widest uppercase font-bold">&copy; 2026 Nore Menu Premium - L'excellence digitale</p>
      </footer>
    </div>
  )
}
