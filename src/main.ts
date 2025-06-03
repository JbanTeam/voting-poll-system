import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './libs/errors/global-exceptions.filter';

const PORT = process.env.PORT || 3000;

async function start() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Voting Poll System')
    .setDescription('**Vote or Die**')
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}/`, 'Local environment')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, documentFactory);

  await app.listen(PORT);
}
start()
  .then(() => console.log(`Server started on ${PORT}`))
  .catch(console.error);
