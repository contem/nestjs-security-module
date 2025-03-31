import { Controller, Get } from '@nestjs/common';

@Controller()
export class TestController {
  @Get()
  getStatus() {
    return {
      message: 'Security test endpoint is working.',
      timestamp: new Date().toISOString(),
    };
  }
}
