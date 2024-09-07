import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { CountryModule } from '@/modules/country.module';

export function setupB2BSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('B2B API')
    .setDescription('API para o frontend')
    .setVersion('1.0')
    .addTag('B2B')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [CountryModule],
  });
  SwaggerModule.setup('api/b2b', app, document);
}