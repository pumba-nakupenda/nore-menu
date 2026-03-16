'use client'

import { useState, useEffect, useMemo } from 'react'
import { Category, Dish } from '@/types'
import { translate } from '@/lib/translate'

export interface MenuFiltersState {
    activeFilter: string | null
    setActiveFilter: (filter: string | null) => void
    activeCategory: string | null
    setActiveCategory: (id: string | null) => void
    searchQuery: string
    setSearchQuery: (q: string) => void
    isSearchOpen: boolean
    setIsSearchOpen: (open: boolean) => void
    toggleFilter: (tag: string) => void
    currentCategory: Category | undefined
    categoryTags: string[]
    searchResults: (Dish & { category: Category })[]
}

export function useMenuFilters(categories: Category[], lang: 'fr' | 'en'): MenuFiltersState {
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Reset filter when switching category
    useEffect(() => {
        setActiveFilter(null)
    }, [activeCategory])

    const currentCategory = categories.find(c => c.id === activeCategory)

    const categoryTags = useMemo(() =>
        Array.from(new Set(
            currentCategory?.dishes?.flatMap((dish: Dish) => dish.tags || []) || []
        )).sort(),
        [currentCategory]
    )

    const toggleFilter = (tag: string) => {
        setActiveFilter(activeFilter === tag ? null : tag)
    }

    const t = (item: any, field: string) => translate(item, field, lang)

    const searchResults = useMemo(() =>
        searchQuery
            ? categories.flatMap(cat =>
                (cat.dishes || [])
                    .filter(dish =>
                        dish.is_available !== false &&
                        (t(dish, 'name').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t(dish, 'description')?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(dish => ({ ...dish, category: cat }))
            )
            : [],
        [searchQuery, categories, lang]
    )

    return {
        activeFilter,
        setActiveFilter,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        toggleFilter,
        currentCategory,
        categoryTags,
        searchResults,
    }
}
