import { v4 as uuidv4 } from 'uuid';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SecurityCacheInterceptor } from './common/interceptors/security-cache.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const keyPath = process.env['SSL_KEY_PATH'];
  const certPath = process.env['SSL_CERT_PATH'];
  const isHttps =
    keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath);

  let app;
  let port: number;

  if (isHttps) {
    logger.log(
      `SSL Certificates found at [${keyPath}] and [${certPath}]. Bootstrapping HTTPS server on port 443...`,
    );
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
    port = 443;
  } else {
    logger.log(
      'SSL Certificates missing or not found. Falling back to HTTP on port 3002...',
    );
    app = await NestFactory.create(AppModule);
    port = process.env['PORT'] ? Number(process.env['PORT']) : 3002;
  }

  // Configure trust proxy for ArvanCloud/upstream reverse proxies
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  logger.log('Express trust proxy enabled successfully');

  // Security: Helmet middleware for security headers
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env['NODE_ENV'] === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable cookie parser
  app.use(cookieParser());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Request ID middleware
  app.use((req: any, _res: any, next: any) => {
    req.requestId = req.headers['x-request-id'] || uuidv4();
    _res.setHeader('x-request-id', req.requestId);
    next();
  });

  // Global response interceptor
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new SecurityCacheInterceptor(),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS configuration
  const corsOrigins = process.env['CORS_ORIGINS']
    ? process.env['CORS_ORIGINS'].split(',')
    : ['http://localhost:3002', 'http://localhost:3001'];

  app.enableCors({
    origin: process.env['NODE_ENV'] === 'production' ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Attribution-Source',
      'Cookie',
    ],
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  const protocol = isHttps ? 'https' : 'http';
  logger.log(`🚀 Server running on ${protocol}://localhost:${port}/api/v1`);
  logger.log(`📝 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.log(`🔒 CORS enabled for: ${corsOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
