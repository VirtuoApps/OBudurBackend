import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator'; // 🔥 class-transformer ile tam uyum için

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // ✅ ValidationPipe with full transform support
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,                 // Gelen verileri DTO sınıfına dönüştür
      whitelist: true,                // DTO dışı alanları çıkar
      forbidNonWhitelisted: true,     // DTO dışı alan gelirse hata ver
      skipMissingProperties: true,    // Eksik alanları es geç
    }),
  );

  // 🔥 ValidationPipe'ın dependency injection içindeki sınıflara erişebilmesi için:
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
