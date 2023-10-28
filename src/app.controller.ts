import { Controller, Get } from '@nestjs/common';

import { AppService } from '@app/app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getStatus() {
    const status = this.appService.getStatus();
    return { status };
  }
}
