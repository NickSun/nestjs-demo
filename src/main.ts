import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
import * as YAML from 'yamljs';
import { AppModule } from './app.module';
import { WinstonLogger } from './github/infrastructure/service/winston-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const openapiSpecPath = path.resolve(__dirname, 'openapi.yaml');

  if (fs.existsSync(openapiSpecPath)) {
    const document = YAML.parseFile(openapiSpecPath);
    SwaggerModule.setup('api', app, document, { customSiteTitle: 'Github User Repositories' });
  }

  app.useLogger(app.get(WinstonLogger));

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
