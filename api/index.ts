import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from '../apps/api/src/app/app.module';

const server = express();
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return server;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');
  await app.init();

  isInitialized = true;
  return server;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await bootstrap();
  app(req, res);
}
