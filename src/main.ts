import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { VersioningType } from '@nestjs/common';
import { setupB2CSwagger } from './api/swagger/api-b2c.config';
import { setupB2BSwagger } from './api/swagger/api-b2b.config';

const banner = `
██████  ███████  ██████  ██  ██████  ███    ██      █████  ██████  ██ 
██   ██ ██      ██       ██ ██    ██ ████   ██     ██   ██ ██   ██ ██ 
██████  █████   ██   ███ ██ ██    ██ ██ ██  ██     ███████ ██████  ██ 
██   ██ ██      ██    ██ ██ ██    ██ ██  ██ ██     ██   ██ ██      ██ 
██   ██ ███████  ██████  ██  ██████  ██   ████     ██   ██ ██      ██ 
`;

console.log(banner);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Api
  setupB2BSwagger(app);
  setupB2CSwagger(app);

  await app.listen(parseInt(process.env.PORT as string, 10) || 3000);
}

bootstrap();
