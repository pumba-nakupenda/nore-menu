import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async uploadAndConvert(file: Express.Multer.File, path: string): Promise<string> {
    try {
      this.logger.log(`Starting conversion for file: ${file.originalname}`);
      
      // 1. Convert to AVIF
      const avifBuffer = await sharp(file.buffer)
        .avif({ quality: 65, effort: 4 })
        .toBuffer();

      this.logger.log(`Conversion successful. Size: ${avifBuffer.length} bytes`);

      const fileName = `${Date.now()}.avif`;
      const fullPath = `${path}/${fileName}`;

      // 2. Upload
      const { data, error } = await this.supabase.getClient()
        .storage
        .from('shop')
        .upload(fullPath, avifBuffer, {
          contentType: 'image/avif',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        this.logger.error(`Supabase Upload Error: ${JSON.stringify(error)}`);
        throw new Error(error.message);
      }

      this.logger.log(`Upload successful: ${fullPath}`);

      // 3. Get Public URL
      const { data: { publicUrl } } = this.supabase.getClient()
        .storage
        .from('shop')
        .getPublicUrl(fullPath);

      return publicUrl;
    } catch (error) {
      this.logger.error(`Image processing failed: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }
}