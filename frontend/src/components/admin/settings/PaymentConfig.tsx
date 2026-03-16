'use client'

import { Coins, Percent, History, Utensils } from 'lucide-react'

interface PaymentConfigProps {
    currency: string
    setCurrency: (v: string) => void
    taxRate: string
    setTaxRate: (v: string) => void
    isTaxIncluded: boolean
    setIsTaxIncluded: (v: boolean) => void
    paymentLogic: 'pay_before' | 'pay_after'
    setPaymentLogic: (v: 'pay_before' | 'pay_after') => void
}

export default function PaymentConfig({
    currency, setCurrency,
    taxRate, setTaxRate,
    isTaxIncluded, setIsTaxIncluded,
    paymentLogic, setPaymentLogic,
}: PaymentConfigProps) {
    return (
        <>
            {/* CURRENCY & TAX */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-6 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Coins className="w-5 h-5 mr-3 text-gold" />
                    <h3>Devise & Taxe</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                            <Coins className="w-4 h-4 text-gold" /> Devise
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-bold shadow-sm cursor-pointer"
                        >
                            <option value="FCFA">FCFA (XOF)</option>
                            <option value="€">Euro (€)</option>
                            <option value="$">Dollar ($)</option>
                            <option value="£">Pound (£)</option>
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 mb-3">
                            <Percent className="w-4 h-4 text-gold" /> Taux de taxe (%)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:bg-white focus:border-brand outline-none text-sm font-bold shadow-sm"
                                placeholder="0"
                            />
                            <button
                                type="button"
                                onClick={() => setIsTaxIncluded(!isTaxIncluded)}
                                className={`shrink-0 px-4 py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${isTaxIncluded ? 'border-brand bg-brand text-white' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                            >
                                {isTaxIncluded ? 'Inc.' : 'Excl.'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT FLOW */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex items-center mb-8 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Coins className="w-5 h-5 mr-3 text-gold" />
                    <h3>Flux de Paiement POS</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setPaymentLogic('pay_before')}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-3 ${paymentLogic === 'pay_before' ? 'border-brand bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentLogic === 'pay_before' ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Paiement à la commande</p>
                            <p className="text-[10px] text-zinc-400 font-medium">Le client paie avant la préparation (Fast-food, Comptoir).</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPaymentLogic('pay_after')}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-3 ${paymentLogic === 'pay_after' ? 'border-brand bg-emerald-50/30' : 'border-zinc-50 bg-zinc-50/50 hover:border-zinc-200'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentLogic === 'pay_after' ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Paiement après service</p>
                            <p className="text-[10px] text-zinc-400 font-medium">Le client consomme puis paie en fin de repas (Restaurant).</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}
