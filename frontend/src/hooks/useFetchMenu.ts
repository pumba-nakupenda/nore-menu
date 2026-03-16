import { api } from '@/lib/api'

export async function fetchMenuData(restaurantId: string) {
    return api.get(`/menu/${restaurantId}`)
}
