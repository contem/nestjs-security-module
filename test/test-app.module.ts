import { Module } from '@nestjs/common';
import { SecurityModule } from '../src/security/security.module';
import { securityConfig } from './config';
import { TestController } from './test.controller';

@Module({
  imports: [SecurityModule.register(securityConfig)],
  controllers: [TestController],
})
export class TestAppModule {}
