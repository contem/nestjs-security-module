import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  Inject,
  Global,
} from '@nestjs/common';
import helmet from 'helmet';
import {
  ConfigModule
} from '@nestjs/config';
import {
  SecurityModuleOptions,
  SecurityModuleAsyncOptions,
} from './security.config';
import { createAuditLogMiddleware } from './middlewares/audit-log.middleware';
import { createRateLimitMiddleware } from './middlewares/rate-limit.middleware';

export const SECURITY_MODULE_OPTIONS = 'SECURITY_MODULE_OPTIONS';

/**
 * SecurityModule provides sync and async config APIs.
 * Use forRoot for static config, forRootAsync to read from ConfigService/env.
 */
@Global()
@Module({})
export class SecurityModule implements NestModule {
  static register(securityConfig: SecurityModuleOptions): import("@nestjs/common").Type<any> | DynamicModule | Promise<DynamicModule> | import("@nestjs/common").ForwardReference<any> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @Inject(SECURITY_MODULE_OPTIONS)
    private readonly options: SecurityModuleOptions,
  ) {}

  /**
   * Synchronous configuration.
   */
  static forRoot(options: SecurityModuleOptions): DynamicModule {
    const optsProvider: Provider = {
      provide: SECURITY_MODULE_OPTIONS,
      useValue: options,
    };
    return {
      module: SecurityModule,
      providers: [optsProvider],
      exports: [optsProvider],
    };
  }

  /**
   * Asynchronous configuration via ConfigModule and ConfigService.
   */
  static forRootAsync(asyncOptions: SecurityModuleAsyncOptions): DynamicModule {
    const asyncOptsProvider: Provider = {
      provide: SECURITY_MODULE_OPTIONS,
      useFactory: asyncOptions.useFactory,
      inject: asyncOptions.inject || [],
    };
    return {
      module: SecurityModule,
      imports: [...(asyncOptions.imports || []), ConfigModule],
      providers: [asyncOptsProvider],
      exports: [asyncOptsProvider],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    const options = this.options;
    if (!options) {
      throw new Error(
        '[SecurityModule] SecurityModuleOptions not provided. Use forRoot or forRootAsync to configure.',
      );
    }

    // Helmet default
    if (options.helmet !== false) {
      consumer.apply(helmet()).forRoutes('*');
    }

    // CORS custom - simple header approach
    if (options.cors) {
      const corsOpts =
        typeof options.cors === 'object' ? options.cors : {};
      consumer
        .apply((_req: any, res: { setHeader: (arg0: string, arg1: any) => void; }, next: () => void) => {
          if (corsOpts.origin) {
            res.setHeader('Access-Control-Allow-Origin', corsOpts.origin);
          }
          if (corsOpts.methods) {
            res.setHeader('Access-Control-Allow-Methods', corsOpts.methods);
          }
          next();
        })
        .forRoutes('*');
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
                "default-src": ["'self'"],
                "script-src": ["'self'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", 'data:'],
              },
            };
      consumer
        .apply(helmet.contentSecurityPolicy(cspConfig))
        .forRoutes('*');
    }

    // X-Frame-Options
    if (options.xFrameOptions) {
      const action =
        typeof options.xFrameOptions === 'string'
          ? options.xFrameOptions.toLowerCase()
          : 'sameorigin';
      consumer
        .apply(helmet.frameguard({ action: action as any }))
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
        .apply((_: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
          res.setHeader(
            'Expect-CT',
            `max-age=${expectCtConfig.maxAge}${
              expectCtConfig.enforce ? ', enforce' : ''
            }`,
          );
          next();
        })
        .forRoutes('*');
    }

    // Permissions-Policy
    if (options.permissionsPolicy) {
      const policy = Object.entries(options.permissionsPolicy)
        .map(([key, val]) => `${key}=(${val.join(' ')})`)
        .join(', ');
      consumer
        .apply((_: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
          res.setHeader('Permissions-Policy', policy);
          next();
        })
        .forRoutes('*');
    }

    // Cross-Origin-Embedder-Policy
    if (options.crossOriginEmbedderPolicy !== false) {
      const coepConfig =
        typeof options.crossOriginEmbedderPolicy === 'object'
          ? options.crossOriginEmbedderPolicy
          : {};
      consumer
        .apply(helmet.crossOriginEmbedderPolicy(coepConfig))
        .forRoutes('*');
    }
  }
}
