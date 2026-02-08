import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ShopService {
    constructor(private readonly supabase: SupabaseService) { }

    // Get all available shop items (public)
    async getAllItems() {
        const client = this.supabase.getClient();
        const { data, error } = await client
            .from('shop_items')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false });

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    // Get all items including unavailable (superadmin only)
    async getAllItemsAdmin(token: string) {
        const client = this.supabase.getClient(token);
        const { data, error } = await client
            .from('shop_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    // Get single item by ID
    async getItemById(id: string) {
        const client = this.supabase.getClient();
        const { data, error } = await client
            .from('shop_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new NotFoundException('Item not found');
        return data;
    }

    // Create new shop item (superadmin only)
    async createItem(itemData: any, token: string) {
        const client = this.supabase.getClient(token);
        const { data, error } = await client
            .from('shop_items')
            .insert(itemData)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    // Update shop item (superadmin only)
    async updateItem(id: string, itemData: any, token: string) {
        const client = this.supabase.getClient(token);
        const { data, error } = await client
            .from('shop_items')
            .update({ ...itemData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    // Delete shop item (superadmin only)
    async deleteItem(id: string, token: string) {
        const client = this.supabase.getClient(token);
        const { error } = await client
            .from('shop_items')
            .delete()
            .eq('id', id);

        if (error) throw new InternalServerErrorException(error.message);
        return { success: true };
    }

    // Toggle item availability (superadmin only)
    async toggleAvailability(id: string, isAvailable: boolean, token: string) {
        const client = this.supabase.getClient(token);
        const { data, error } = await client
            .from('shop_items')
            .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }
}
