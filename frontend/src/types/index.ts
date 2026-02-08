export interface Badge {
    id: string
    restaurant_id: string
    category_id: string
    name: string        // Default/FR
    name_en?: string    // EN
    icon: string
    color?: string
    bg_color?: string
    border_color?: string
}

export interface Category {
    id: string
    name: string        // Default/FR
    name_en?: string    // EN
    restaurant_id: string
    order: number
    dishes?: Dish[]
    badges?: Badge[]
}

export interface Dish {
    id: string
    category_id: string
    name: string        // Default/FR
    name_en?: string    // EN
    description: string // Default/FR
    description_en?: string // EN
    price: number
    image_url?: string
    tags?: string[]
    is_available?: boolean
    is_sold_out?: boolean
}