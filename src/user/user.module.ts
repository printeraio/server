import { Module } from '@nestjs/common';

import { UserController } from '@app/user/user.controller';
import { UserService } from '@app/user/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
