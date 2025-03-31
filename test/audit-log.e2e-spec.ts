import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestAppModule } from './test-app.module';

describe('Audit Log (e2e)', () => {
  let app: INestApplication;

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should log request via audit log middleware', async () => {
    await request(app.getHttpServer()).get('/');

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[AuditLog]',
      expect.stringContaining('GET /'),
    );
  });
  afterAll(async () => {
    await app.close();
    consoleSpy.mockRestore();
  });
});
