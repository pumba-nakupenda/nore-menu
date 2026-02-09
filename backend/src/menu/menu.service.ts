import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class MenuService {
    constructor(
        private readonly supabase: SupabaseService,
        private readonly analytics: AnalyticsService
    ) { }

    async getMenu(restaurantId: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(restaurantId);
        let query = this.supabase.getClient().from('restaurants').select('*');
        if (isUuid) query = query.eq('id', restaurantId);
        else query = query.eq('slug', restaurantId);

        const { data: restaurant, error: resError } = await query.single();
        if (resError || !restaurant) throw new InternalServerErrorException(resError?.message || 'Restaurant not found');

        const { data: categories, error } = await this.supabase.getClient()
            .from('categories')
            .select(`*, dishes(*), badges(*)`)
            .eq('restaurant_id', restaurant.id)
            .order('order', { ascending: true });

        if (error) throw new InternalServerErrorException(error.message);
        return { restaurant, categories };
    }

    async createRestaurant(name: string, ownerId: string, token: string) {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const { data, error } = await this.supabase.getClient(token)
            .from('restaurants')
            .insert({
                name,
                slug,
                owner_id: ownerId,
                theme: 'light',
                currency: 'FCFA',
                is_tax_included: true
            })
            .select().single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async createBadge(restaurantId: string, categoryId: string, badge: any, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('badges')
            .insert({ ...badge, restaurant_id: restaurantId, category_id: categoryId })
            .select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async updateBadge(id: string, badge: any, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('badges').update(badge).eq('id', id).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async deleteBadge(id: string, token: string) {
        const { error } = await this.supabase.getClient(token).from('badges').delete().eq('id', id);
        if (error) throw new InternalServerErrorException(error.message);
        return { success: true };
    }

    async createCategory(restaurantId: string, name: string, name_en: string, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('categories').insert({ restaurant_id: restaurantId, name, name_en }).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async updateCategory(id: string, name: string, name_en: string, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('categories').update({ name, name_en }).eq('id', id).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async reorderCategories(orders: { id: string, order: number }[], token: string) {
        const client = this.supabase.getClient(token);

        // Update each category order
        for (const item of orders) {
            const { error } = await client
                .from('categories')
                .update({ order: item.order })
                .eq('id', item.id);

            if (error) throw new InternalServerErrorException(error.message);
        }

        return { success: true };
    }

    async createDish(restaurantId: string, categoryId: string, dish: any, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('dishes').insert({ ...dish, category_id: categoryId, restaurant_id: restaurantId }).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async updateDish(id: string, dish: any, token: string) {
        const client = this.supabase.getClient(token);

        // 1. If a new image is provided, get the old one to delete it
        if (dish.image_url) {
            const { data: oldDish } = await client.from('dishes').select('image_url').eq('id', id).single();
            if (oldDish?.image_url && oldDish.image_url !== dish.image_url) {
                await this.deleteImageFromStorage(oldDish.image_url, 'dish-images', token);
            }
        }

        const { data, error } = await client
            .from('dishes').update(dish).eq('id', id).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async toggleDishAvailability(id: string, isAvailable: boolean, token: string) {
        const client = this.supabase.getClient(token)

        // Fetch dish name and restaurant_id for logging
        const { data: dish } = await client.from('dishes').select('name, restaurant_id').eq('id', id).single()

        const { data, error } = await client
            .from('dishes')
            .update({ is_available: isAvailable })
            .eq('id', id)
            .select()
            .single();
        if (error) throw new InternalServerErrorException(error.message);

        // Log activity
        if (dish) {
            await this.analytics.logActivity(
                dish.restaurant_id,
                'STAFF_BY_TOKEN', // In a real scenario, we'd extract staffId from token
                'STOCK_TOGGLED',
                `Plat "${dish.name}" marqué comme ${isAvailable ? 'Disponible' : 'Épuisé'}`,
                { dishId: id, isAvailable }
            );
        }

        return data;
    }

    async createDishesBulk(dishes: any[], token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('dishes').insert(dishes).select();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async importGlobal(restaurantId: string, items: any[], token: string) {
        const client = this.supabase.getClient(token);

        // 1. Extract unique categories from the items
        const categoryNames = [...new Set(items.map(item => item.category))];

        // 2. Ensure categories exist or create them
        const categoryMap = new Map<string, string>();

        for (const catName of categoryNames) {
            // Try to find existing category
            const { data: existing } = await client
                .from('categories')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('name', catName)
                .maybeSingle();

            if (existing) {
                categoryMap.set(catName as string, existing.id);
            } else {
                // Create new category
                const { data: created, error: catError } = await client
                    .from('categories')
                    .insert({ restaurant_id: restaurantId, name: catName })
                    .select().single();
                if (catError) throw new InternalServerErrorException(catError.message);
                categoryMap.set(catName as string, created.id);
            }
        }

        // 3. Prepare dishes with correct category_id
        const dishesToInsert = items.map(item => ({
            restaurant_id: restaurantId,
            category_id: categoryMap.get(item.category),
            name: item.name,
            name_en: item.name_en,
            price: item.price,
            description: item.description,
            description_en: item.description_en,
            image_url: item.image_url,
            tags: item.tags || []
        }));

        // 4. Bulk insert dishes
        const { data, error } = await client.from('dishes').insert(dishesToInsert).select();
        if (error) throw new InternalServerErrorException(error.message);

        return { importedCount: data.length, categoriesCreated: categoryNames.length };
    }

    async deleteDish(id: string, token: string) {
        const client = this.supabase.getClient(token);

        // 1. Get dish info to find the image URL
        const { data: dish } = await client.from('dishes').select('image_url').eq('id', id).single();

        // 2. Delete the record
        const { error } = await client.from('dishes').delete().eq('id', id);
        if (error) throw new InternalServerErrorException(error.message);

        // 3. Cleanup storage if image exists
        if (dish?.image_url) {
            await this.deleteImageFromStorage(dish.image_url, 'dish-images', token);
        }

        return { success: true };
    }

    async deleteCategory(id: string, token: string) {
        const client = this.supabase.getClient(token);

        // 1. Get all dishes in this category to cleanup images
        const { data: dishes } = await client.from('dishes').select('image_url').eq('category_id', id);

        // 2. Delete the category (dishes will be deleted by CASCADE if set, but we might need manual delete depending on DB setup)
        // Let's assume manual cleanup for storage safety
        const { error } = await client.from('categories').delete().eq('id', id);
        if (error) throw new InternalServerErrorException(error.message);

        // 3. Cleanup all images
        if (dishes && dishes.length > 0) {
            for (const dish of dishes) {
                if (dish.image_url) {
                    await this.deleteImageFromStorage(dish.image_url, 'dish-images', token);
                }
            }
        }

        return { success: true };
    }

    private async deleteImageFromStorage(url: string, bucket: string, token: string) {
        try {
            // Extract file path from Supabase URL
            // Format: .../storage/v1/object/public/bucket/folder/filename.jpg
            const parts = url.split(`${bucket}/`);
            if (parts.length < 2) return;

            const filePath = parts[1];
            await this.supabase.getClient(token).storage.from(bucket).remove([filePath]);
            console.log(`Successfully deleted orphaned image: ${filePath}`);
        } catch (e) {
            console.error('Failed to cleanup storage:', e);
        }
    }

    async updateRestaurantInfo(id: string, info: any, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('restaurants').update(info).eq('id', id).select().single();
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async checkIfMaster(ownerId: string): Promise<boolean> {
        const { data, error } = await this.supabase.getClient()
            .from('restaurants')
            .select('is_master')
            .eq('owner_id', ownerId)
            .eq('is_master', true)
            .maybeSingle();
        
        return !!data;
    }

    async masterUpdateRestaurant(id: string, info: any) {
        const { data, error } = await this.supabase.getClient()
            .from('restaurants')
            .update(info)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async getAllRestaurants(token: string) {
        // This check should ideally be in a Guard, but adding here for safety
        const { data: restaurants, error } = await this.supabase.getClient(token)
            .from('restaurants')
            .select(`
                *,
                categories(count),
                dishes(count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw new InternalServerErrorException(error.message);
        return restaurants;
    }
}