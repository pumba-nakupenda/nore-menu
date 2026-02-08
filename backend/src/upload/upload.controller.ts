import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avif')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('path') path: string = 'general'
  ) {
    const url = await this.uploadService.uploadAndConvert(file, path);
    return { url };
  }
}
