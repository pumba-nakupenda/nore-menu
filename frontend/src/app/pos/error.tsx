'use client'

import { useEffect } from 'react'

export default function POSError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('POS error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-zinc-50">
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Erreur du terminal</h2>
            <p className="text-zinc-500 mb-8">
                Le terminal de vente a rencontré une erreur. Veuillez réessayer.
            </p>
            <button
                onClick={reset}
                className="px-8 py-4 bg-[#064e3b] text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all"
            >
                Réessayer
            </button>
        </div>
    )
}
