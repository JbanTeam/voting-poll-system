import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = process.env.PORT ?? 3000;

async function start() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(port);
}
start()
  .then(() => console.log(`Server started on ${port}`))
  .catch(console.error);
