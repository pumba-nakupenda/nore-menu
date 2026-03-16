'use client'

import { useEffect } from 'react'

export default function MenuError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Menu error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Menu indisponible</h2>
            <p className="text-zinc-500 mb-8">
                Impossible de charger ce menu. Veuillez réessayer.
            </p>
            <button
                onClick={reset}
                className="px-8 py-4 bg-brand text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all"
            >
                Réessayer
            </button>
        </div>
    )
}
