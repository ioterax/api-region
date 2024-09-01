import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

// OpenApi
// https://rehmat-sayany.medium.com/integrating-swagger-with-nestjs-a-step-by-step-guide-abd532743c43

// const app = async () => await NestFactory.create(AppModule);

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
    .setDescription('API to work with Countries, States data.')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
