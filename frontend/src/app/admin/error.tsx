'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin error:', error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Une erreur est survenue</h2>
            <p className="text-zinc-500 mb-8 max-w-md">
                Quelque chose s'est mal passé. Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            <button
                onClick={reset}
                className="px-8 py-4 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
            >
                Réessayer
            </button>
        </div>
    )
}
