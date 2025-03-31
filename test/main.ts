import { NestFactory } from '@nestjs/core';
import { TestAppModule } from './test-app.module';

async function bootstrap() {
  const app = await NestFactory.create(TestAppModule);
  await app.listen(3001);
  console.log('🚀 Test App is running at http://localhost:3001');
}
bootstrap();
