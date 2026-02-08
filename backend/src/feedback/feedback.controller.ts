import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    async submitFeedback(@Body() body: { restaurantId: string; rating: number; comment: string; tableNumber?: string }) {
        return this.feedbackService.createFeedback(body.restaurantId, body.rating, body.comment, body.tableNumber);
    }

    @UseGuards(SupabaseGuard)
    @Get(':restaurantId')
    async getFeedbacks(@Req() req: any, @Param('restaurantId') restaurantId: string) {
        const token = this.extractToken(req);
        return this.feedbackService.getRestaurantFeedbacks(restaurantId, token);
    }

    private extractToken(req: any): string {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : '';
    }
}
