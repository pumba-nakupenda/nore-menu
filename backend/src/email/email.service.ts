import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    // Uses provided key as fallback
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_H3eSWEg1_2fwMURPHXHPoa6whhixpovm5');
  }

  async sendWelcomeEmail(to: string, restaurantName: string) {
    try {
      await this.resend.emails.send({
        from: 'Nore Menu <welcome@noremenu.com>', // You will need to verify your domain on Resend
        to: [to],
        subject: `Bienvenue chez Nore Menu, ${restaurantName}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #064e3b; margin: 0;">Nore Menu</h1>
              <p style="color: #c5a059; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: bold;">L'excellence digitale</p>
            </div>
            
            <h2 style="color: #333;">Félicitations pour le lancement de votre menu !</h2>
            <p style="color: #666; line-height: 1.6;">
              Nous sommes ravis de vous accompagner dans la digitalisation de <strong>${restaurantName}</strong>. 
              Votre espace d'administration est désormais prêt.
            </p>
            
            <div style="background: #fdfcfb; padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid #eee;">
              <h3 style="margin-top: 0; color: #064e3b;">Prochaines étapes :</h3>
              <ul style="color: #555; padding-left: 20px;">
                <li>Ajoutez vos premières catégories et plats.</li>
                <li>Personnalisez vos QR codes de table.</li>
                <li>Partagez votre lien sur vos réseaux sociaux.</li>
              </ul>
            </div>
            
            <a href="https://noremenu.com/login" style="display: block; background: #064e3b; color: white; text-align: center; padding: 15px; border-radius: 10px; text-decoration: none; font-weight: bold;">
              Accéder à mon Dashboard
            </a>
            
            <p style="color: #999; font-size: 12px; margin-top: 40px; text-align: center;">
              &copy; ${new Date().getFullYear()} Nore Menu Premium. Tous droits réservés.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendWeeklyReport(to: string, restaurantName: string, stats: { views: number, scans: number }) {
    // Logic for weekly report...
  }
}
