import { Module } from '@nestjs/common';

import { PrinterController } from '@app/printer/printer.controller';
import { PrinterService } from '@app/printer/printer.service';

@Module({
  controllers: [PrinterController],
  providers: [PrinterService],
})
export class PrinterModule {}
