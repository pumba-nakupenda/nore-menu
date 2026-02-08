import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FeedbackService {
    constructor(private readonly supabase: SupabaseService) { }

    async createFeedback(restaurantId: string, rating: number, comment: string, tableNumber?: string) {
        const { data, error } = await this.supabase.getClient()
            .from('feedbacks')
            .insert({
                restaurant_id: restaurantId,
                rating,
                comment,
                table_number: tableNumber || null
            })
            .select().single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async getRestaurantFeedbacks(restaurantId: string, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('feedbacks')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }
}
