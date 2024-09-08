import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { CountryModule } from '@/modules/country.module';

export function setupB2CSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('B2C API')
    .setDescription('API para integração entre sistemas')
    .setVersion('1.0')
    .addTag('B2C')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [CountryModule],
  });
  SwaggerModule.setup('api/b2c', app, document);
}