import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@app/auth/auth.guard';
import { CreatePrinterDto } from '@app/printer/dto/create-printer.dto';
import { PrinterService } from '@app/printer/printer.service';
import { RequestHeaders } from '@app/types';

@Controller('printers')
@UseGuards(AuthGuard)
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Get()
  async findAll(@Headers() { user }: RequestHeaders) {
    const printers = await this.printerService.findAll(user.id);
    return { printers };
  }

  @Post('create')
  async create(@Headers() { user }: RequestHeaders, @Body() { clientId, hardwareId }: CreatePrinterDto) {
    const printer = await this.printerService.create(user.id, clientId, hardwareId);
    return { printer };
  }
}
