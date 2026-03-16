'use client'

import { Clock } from 'lucide-react'

interface OpeningHoursEditorProps {
    openingHours: any[]
    setOpeningHours: (hours: any[]) => void
}

export default function OpeningHoursEditor({ openingHours, setOpeningHours }: OpeningHoursEditorProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8">
            <div className="flex items-center gap-3 text-zinc-900 font-black uppercase tracking-[0.2em] text-[10px]">
                <Clock className="w-5 h-5 text-gold" />
                <h3>Horaires d'Ouverture</h3>
            </div>

            <div className="space-y-4">
                {openingHours.map((dayObj, index) => (
                    <div key={dayObj.day} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0 group">
                        <span className="text-sm font-bold text-zinc-700 w-24">{dayObj.day}</span>
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            <input
                                type="text"
                                value={dayObj.hours}
                                onChange={(e) => {
                                    const newHours = [...openingHours]
                                    newHours[index].hours = e.target.value
                                    setOpeningHours(newHours)
                                }}
                                disabled={!dayObj.isOpen}
                                placeholder="09:00 - 22:00"
                                className="bg-zinc-50 border border-black/5 rounded-xl px-4 py-2 text-xs font-bold w-32 focus:bg-white focus:border-brand outline-none transition-all disabled:opacity-30"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newHours = [...openingHours]
                                    newHours[index].isOpen = !newHours[index].isOpen
                                    setOpeningHours(newHours)
                                }}
                                className={`w-12 h-6 rounded-full relative transition-all ${dayObj.isOpen ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dayObj.isOpen ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
