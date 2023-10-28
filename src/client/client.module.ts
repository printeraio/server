import { Module } from '@nestjs/common';

import { ClientController } from '@app/client/client.controller';
import { ClientService } from '@app/client/client.service';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
