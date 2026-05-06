import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import './common/extensions/string.extensions';
// import './common/extensions/number.extensions';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { CONFIG } from './config';

async function bootstrap() {
  const port = CONFIG.app.port;

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    origin: CONFIG.app.corsOrigins.split(','),
  });

  const swaggerTitle = CONFIG.app.swaggerTitle;

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(CONFIG.app.swaggerPath, app, document);

  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(port);
}
bootstrap();
