import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

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

  const config = new DocumentBuilder()
    .setTitle('Region API')
    .setDescription('API to work with Countries and States data.')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(parseInt(process.env.PORT as string, 10) || 3000);
}
bootstrap();
