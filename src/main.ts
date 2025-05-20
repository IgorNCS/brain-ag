import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture')
    .setDescription('Documentação do Brain Agriculture')
    .setContact(
      'Igor Nascimento da Costa Silva',
      'https://github.com/IgorNCS',
      'igor.ncsilva@hotmail.com',
    )
    .setVersion('1.0')
    .addTag('brain-agriculture')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation/api', app, document);


  writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
  console.log('Documentação Swagger JSON gerada em swagger-spec.json');
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation/api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
