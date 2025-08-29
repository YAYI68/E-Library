import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  logger.log('Application created');

  app.use(helmet());

  // Allow all origins + methods in dev
  app.enableCors({
    origin: true, // accept all origins
    methods: '*', // accept all HTTP methods
    allowedHeaders: '*', // accept all headers
    credentials: true,
  });

   // API documentation
  const config = new DocumentBuilder()
    .setTitle('Digital Library API')
    .setDescription('A lightweight backend service for a digital library')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Api Versioning 
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
