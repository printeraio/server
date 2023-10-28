import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '@app/auth/auth.service';
import { CreateAuthDto } from '@app/auth/dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() { email, password }: Pick<CreateAuthDto, 'email' | 'password'>) {
    return this.authService.login(email, password);
  }

  @Post('register')
  register(@Body() { email, password, firstName, lastName }: CreateAuthDto) {
    return this.authService.register(email, password, firstName, lastName);
  }

  @Post('refresh')
  refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refresh(refreshToken);
  }
}
