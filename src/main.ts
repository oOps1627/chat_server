import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(cookieParser());
  app.use(
    session({
      secret: "my secret",
      name: "sid",
      saveUninitialized: false,
      resave: false,
      cookie: {
        path: "/",
        httpOnly: false,
        maxAge: null
      }
    }),
  );

  addSwagger(app);

  await app.listen(3000);
}
bootstrap();

function addSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Quick Chat')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('/swagger', app, document);
}
