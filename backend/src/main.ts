import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activer CORS pour permettre au frontend Vercel de communiquer avec le backend Render
  app.enableCors();

  // Utiliser le port fourni par Render ou 10000 par défaut
  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();