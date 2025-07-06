import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import helmet from 'helmet';
import { SecurityModuleOptions,SecurityModuleAsyncOptions } from './security.config';
import { createAuditLogMiddleware } from './middlewares/audit-log.middleware';
import { createRateLimitMiddleware } from './middlewares/rate-limit.middleware';
const SECURITY_OPTIONS = Symbol('SECURITY_OPTIONS');

@Module({})
export class SecurityModule implements NestModule {
  static options: SecurityModuleOptions;
  static enableCors = false;
  static corsOptions: any = undefined;
  static sanitizeEnabled = false;

  static forRoot(options: SecurityModuleOptions): DynamicModule {
    const optsProvider: Provider = {
      provide: SECURITY_OPTIONS,
      useValue: options,
    };
    return {
      module: SecurityModule,
      providers: [optsProvider],
    };
  }

  static forRootAsync(opts: SecurityModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: SECURITY_OPTIONS,
      useFactory: opts.useFactory,
      inject: opts.inject || [],
    };
    return {
      module: SecurityModule,
      imports: opts.imports || [],
      providers: [asyncProvider],
    };
  }

  static register(options: SecurityModuleOptions): DynamicModule {
    this.options = options;
    this.sanitizeEnabled = !!options.sanitize;

    // 🔧 Bunları ekle:
    this.enableCors = !!options.cors;
    this.corsOptions =
      typeof options.cors === 'object' ? options.cors : undefined;

    return {
      module: SecurityModule,
    };
  }

  constructor(
    // Nest, SECURITY_OPTIONS token’ıyla register ettiğiniz değeri buraya inject edecek
    @Inject(SECURITY_OPTIONS) private options: SecurityModuleOptions,
  ) {}
  
  configure(consumer: MiddlewareConsumer) {
    const options = SecurityModule.options;

    // Helmet genel
    if (options.helmet !== false) {
      consumer.apply(helmet()).forRoutes('*');
    }

    // CORS
    if (options.cors) {
      SecurityModule.enableCors = true;
      SecurityModule.corsOptions =
        typeof options.cors === 'object' ? options.cors : undefined;
    }

    // Rate Limiting
    if (options.rateLimit) {
      consumer
        .apply(createRateLimitMiddleware(options.rateLimit))
        .forRoutes('*');
    }

    // Audit Log
    if (options.auditLog) {
      consumer.apply(createAuditLogMiddleware()).forRoutes('*');
    }

    // CSP
    if (options.csp) {
      const cspConfig =
        typeof options.csp === 'object'
          ? options.csp
          : {
              useDefaults: true,
              directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", 'data:'],
              },
            };
      consumer.apply(helmet.contentSecurityPolicy(cspConfig)).forRoutes('*');
    }

    // X-Frame-Options
    if (options.xFrameOptions) {
      const frameValue =
        typeof options.xFrameOptions === 'string'
          ? options.xFrameOptions.toLowerCase()
          : 'sameorigin';
      consumer
        .apply(
          helmet.frameguard({
            action: frameValue as 'sameorigin' | 'deny',
          }),
        )
        .forRoutes('*');
    }

    // Referrer-Policy
    if (options.referrerPolicy) {
      const policy =
        typeof options.referrerPolicy === 'object'
          ? options.referrerPolicy
          : { policy: 'no-referrer' };
      consumer.apply(helmet.referrerPolicy(policy)).forRoutes('*');
    }

    // HSTS
    if (options.hsts) {
      const hstsConfig =
        typeof options.hsts === 'object'
          ? options.hsts
          : { maxAge: 60 * 60 * 24 * 180 };
      consumer.apply(helmet.hsts(hstsConfig)).forRoutes('*');
    }

    // X-Content-Type-Options
    if (options.xContentTypeOptions !== false) {
      consumer.apply(helmet.noSniff()).forRoutes('*');
    }

    // Expect-CT
    if (options.expectCt) {
      const expectCtConfig =
        typeof options.expectCt === 'object'
          ? options.expectCt
          : { maxAge: 86400, enforce: true };

      consumer
        .apply(
          (
            req,
            res: import('express').Response,
            next: import('express').NextFunction,
          ) => {
            res.setHeader(
              'Expect-CT',
              `max-age=${expectCtConfig.maxAge}${
                expectCtConfig.enforce ? ', enforce' : ''
              }`,
            );
            next();
          },
        )
        .forRoutes('*');
    }

    // Permissions-Policy
    if (options.permissionsPolicy) {
      const policy = Object.entries(
        options.permissionsPolicy as Record<string, string[]>,
      )
        .map(([key, val]) => `${key}=(${val.join(' ')})`)
        .join(', ');

      consumer
        .apply(
          (
            req,
            res: import('express').Response,
            next: import('express').NextFunction,
          ) => {
            res.setHeader('Permissions-Policy', policy);
            next();
          },
        )
        .forRoutes('*');
    }

    // COEP
    if (options.crossOriginEmbedderPolicy !== false) {
      const coep =
        typeof options.crossOriginEmbedderPolicy === 'object'
          ? options.crossOriginEmbedderPolicy
          : {};
      consumer.apply(helmet.crossOriginEmbedderPolicy(coep)).forRoutes('*');
    }
  }
}
