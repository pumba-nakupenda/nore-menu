import { Leaf, Carrot, Beef, Flame, WheatOff, Medal, Fish, ShieldCheck } from 'lucide-react'

export const DIETARY_TAGS = [
    { name: 'Vegan', name_en: 'Vegan', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
    { name: 'Végétarien', name_en: 'Vegetarian', icon: Carrot, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
    { name: 'Viande', name_en: 'Meat', icon: Beef, color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
    { name: 'Pimenté', name_en: 'Spicy', icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { name: 'Sans Gluten', name_en: 'Gluten Free', icon: WheatOff, color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
    { name: 'Halal', name_en: 'Halal', icon: Medal, color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
    { name: 'Fruits de mer', name_en: 'Seafood', icon: Fish, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    { name: 'Sans arachides', name_en: 'Nut Free', icon: ShieldCheck, color: 'text-zinc-700', bgColor: 'bg-zinc-200', borderColor: 'border-zinc-300' },
]