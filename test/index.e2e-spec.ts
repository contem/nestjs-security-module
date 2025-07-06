// test/index.e2e-spec.ts
import { INestApplication, ValidationPipe, Module, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { SecurityModule } from '../src/security/security.module';

@Controller()
class TestController {
  @Get()
  getRoot(): string {
    return 'ok';
  }
}

@Module({
  imports: [
    // .env’i load eder
    ConfigModule.forRoot({ isGlobal: true }),

    // SecurityModule’ü async olarak konfigüre et
    SecurityModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        helmet: cfg.get<boolean>('SECURITY_HELMET', true),
        cors: cfg.get<boolean>('SECURITY_CORS', true)
          ? {
              origin: cfg.get<string>('CORS_ORIGIN', '*'),
              methods: cfg.get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE'),
            }
          : undefined,
        rateLimit: cfg.get<boolean>('SECURITY_RATE_LIMIT', true)
          ? {
              windowMs: cfg.get<number>('RATE_LIMIT_WINDOW', 60000),
              max: cfg.get<number>('RATE_LIMIT_MAX', 5),
            }
          : undefined,
        auditLog: cfg.get<boolean>('SECURITY_AUDIT_LOG', true),
        csp: cfg.get<boolean>('SECURITY_CSP', true)
          ? { directives: { defaultSrc: ["'self'"] } }
          : undefined,
        sanitize: cfg.get<boolean>('SECURITY_SANITIZE', true),
        referrerPolicy: cfg.get<boolean>('SECURITY_REFERRER', true)
          ? { policy: 'no-referrer' }
          : undefined,
        xFrameOptions: cfg.get<boolean>('SECURITY_XFRAME', true) ? 'SAMEORIGIN' : undefined,
        hsts: cfg.get<boolean>('SECURITY_HSTS', true)
          ? {
              maxAge: cfg.get<number>('SECURITY_HSTS_MAX_AGE', 31536000),
              includeSubDomains: true,
            }
          : undefined,
        xContentTypeOptions: cfg.get<boolean>('SECURITY_XCONTENT_TYPE_OPTIONS', true),
        expectCt: cfg.get<boolean>('SECURITY_EXPECT_CT', true)
          ? {
              maxAge: cfg.get<number>('SECURITY_EXPECT_CT_MAX_AGE', 30),
              enforce: true,
            }
          : undefined,
        permissionsPolicy: cfg.get<boolean>('SECURITY_PERMISSIONS', true)
          ? { geolocation: ['self'] }
          : undefined,
        crossOriginEmbedderPolicy: cfg.get<boolean>('SECURITY_COEP', true),
      }),
    }),
  ],
  controllers: [TestController], // ← Burayı unutma!
})
class TestSecurityModule {}

describe('SecurityModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture: TestingModule = await Test.createTestingModule({
      imports: [TestSecurityModule],
    }).compile();

    app = fixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should apply all configured security headers on GET /', async () => {
    const res = await request(app.getHttpServer()).get('/').set('Origin', 'http://example.com');
    expect(res.status).toBe(200);

    const h = res.headers;

    if (process.env.SECURITY_CORS === 'true') {
      expect(h['access-control-allow-origin']).toBe('*');
    }
    if (process.env.SECURITY_HELMET === 'true') {
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h).toHaveProperty('x-frame-options');
      expect(h).toHaveProperty('x-dns-prefetch-control');
    }
    if (process.env.SECURITY_CSP === 'true') {
      expect(h).toHaveProperty('content-security-policy');
    }
    if (process.env.SECURITY_REFERRER === 'true') {
      expect(h).toHaveProperty('referrer-policy');
    }
    if (process.env.SECURITY_HSTS === 'true') {
      expect(h).toHaveProperty('strict-transport-security');
    }
    if (process.env.SECURITY_EXPECT_CT === 'true') {
      expect(h['expect-ct']).toContain('max-age');
    }
    if (process.env.SECURITY_PERMISSIONS === 'true') {
      expect(h['permissions-policy']).toContain('geolocation');
    }
    if (process.env.SECURITY_COEP === 'true') {
      expect(h).toHaveProperty('cross-origin-embedder-policy');
    }
    if (process.env.SECURITY_RATE_LIMIT === 'true') {
      expect(h).toHaveProperty('ratelimit-limit');
      expect(h).toHaveProperty('ratelimit-remaining');
    }
  });
});
