import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { MasterGuard } from '../auth/master.guard';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getSiteContent() {
    return this.contentService.getSiteContent();
  }

  @Get('hardware')
  async getHardwareProducts() {
    return this.contentService.getHardwareProducts();
  }

  @UseGuards(SupabaseGuard, MasterGuard)
  @Get('hardware/all')
  async getAllHardwareProducts() {
    return this.contentService.getAllHardwareProducts();
  }

  @UseGuards(SupabaseGuard, MasterGuard)
  @Post(':key')
  async upsertContent(@Param('key') key: string, @Body() body: { value: any }) {
    return this.contentService.upsertContent(key, body.value);
  }

  @UseGuards(SupabaseGuard, MasterGuard)
  @Post('hardware/create')
  async createHardwareProduct(@Body() body: any) {
    return this.contentService.createHardwareProduct(body);
  }

  @UseGuards(SupabaseGuard, MasterGuard)
  @Patch('hardware/:id')
  async updateHardwareProduct(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateHardwareProduct(id, body);
  }

  @UseGuards(SupabaseGuard, MasterGuard)
  @Delete('hardware/:id')
  async deleteHardwareProduct(@Param('id') id: string) {
    return this.contentService.deleteHardwareProduct(id);
  }
}
