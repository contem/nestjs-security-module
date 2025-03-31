import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestAppModule } from './test-app.module';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should throttle after limit is exceeded', async () => {
    const server = app.getHttpServer() as import('http').Server;

    // İlk 5 istek başarılı olmalı
    for (let i = 0; i < 5; i++) {
      const res = await request(server).get('/');
      expect(res.status).toBe(200);
    }

    // 6. istek limit sonrası: 429 Too Many Requests
    const res = await request(server).get('/');
    expect(res.status).toBe(429);
  });

  afterAll(async () => {
    await app.close();
  });
});
