import { type LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@app/app.module';
import { isProduction } from '@app/constants';

type Environment = 'production' | 'development';

async function bootstrap() {
  const logLevels: Record<Environment, LogLevel[]> = {
    production: ['log', 'error', 'warn'],
    development: ['log', 'error', 'warn', 'debug', 'verbose'],
  };

  const app = await NestFactory.create(AppModule, {
    logger: isProduction ? logLevels.production : logLevels.development,
  });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Printera API')
    .setDescription('The Printera API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
