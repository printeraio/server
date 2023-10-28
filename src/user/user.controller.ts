import { Controller, Get, Headers, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@app/auth/auth.guard';
import { RequestHeaders } from '@app/types';
import { UserService } from '@app/user/user.service';

@Controller('me')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async me(@Headers() { user }: RequestHeaders) {
    const me = await this.userService.findOne(user.id);
    return { me };
  }
}
