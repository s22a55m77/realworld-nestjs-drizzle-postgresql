import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('Real World')
    .setDescription('The drizzle implementation of Real World API.')
    .setVersion('1.0')
    .addTag('Real World')
    .addSecurity('JWT', {
      type: 'apiKey',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token with prefix "Token"',
      in: 'header',
    })
    .setBasePath('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
