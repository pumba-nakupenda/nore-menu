import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
    async generateQrCode(text: string): Promise<string> {
        // Returns a Data URL (base64 image)
        return QRCode.toDataURL(text);
    }
}
