import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    // Public endpoint - Get all available items
    @Get()
    async getAllItems() {
        return this.shopService.getAllItems();
    }

    // Public endpoint - Get single item
    @Get(':id')
    async getItemById(@Param('id') id: string) {
        return this.shopService.getItemById(id);
    }

    // Superadmin endpoint - Get all items including unavailable
    @UseGuards(SupabaseGuard)
    @Get('admin/all')
    async getAllItemsAdmin(@Req() req: any) {
        const token = this.extractToken(req);
        return this.shopService.getAllItemsAdmin(token);
    }

    // Superadmin endpoint - Create item
    @UseGuards(SupabaseGuard)
    @Post()
    async createItem(@Body() body: any, @Req() req: any) {
        const token = this.extractToken(req);
        return this.shopService.createItem(body, token);
    }

    // Superadmin endpoint - Update item
    @UseGuards(SupabaseGuard)
    @Patch(':id')
    async updateItem(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const token = this.extractToken(req);
        return this.shopService.updateItem(id, body, token);
    }

    // Superadmin endpoint - Delete item
    @UseGuards(SupabaseGuard)
    @Delete(':id')
    async deleteItem(@Param('id') id: string, @Req() req: any) {
        const token = this.extractToken(req);
        return this.shopService.deleteItem(id, token);
    }

    // Superadmin endpoint - Toggle availability
    @UseGuards(SupabaseGuard)
    @Patch(':id/availability')
    async toggleAvailability(@Param('id') id: string, @Body() body: { isAvailable: boolean }, @Req() req: any) {
        const token = this.extractToken(req);
        return this.shopService.toggleAvailability(id, body.isAvailable, token);
    }

    private extractToken(req: any): string {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : '';
    }
}
