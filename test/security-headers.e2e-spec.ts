import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestAppModule } from './test-app.module';
import { SecurityModule } from '../src/security/security.module';

describe('Security Headers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // ✅ Bu satır INIT'TEN ÖNCE olmalı!
    if (SecurityModule.enableCors) {
      app.enableCors(SecurityModule.corsOptions);
    }

    await app.init();
  });

  it('should include all configured security headers', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('Origin', 'http://localhost:3000'); // ✅ bu sayede CORS header'ı tetiklenir

    // Helmet headers
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');

    // CORS
    expect(res.headers['access-control-allow-origin']).toBe('*');

    // CSP
    expect(res.headers['content-security-policy']).toContain('default-src');

    // Referrer Policy
    expect(res.headers['referrer-policy']).toBe('no-referrer');

    // HSTS
    expect(res.headers['strict-transport-security']).toContain(
      'max-age=31536000',
    );

    // Expect-CT
    expect(res.headers['expect-ct']).toContain('enforce');
    expect(res.headers['expect-ct']).toContain('max-age=30');

    // Permissions-Policy
    expect(res.headers['permissions-policy']).toContain('geolocation');
    expect(res.headers['permissions-policy']).toContain('microphone');

    // COEP
    expect(res.headers['cross-origin-embedder-policy']).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
