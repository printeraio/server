import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from '@app/auth/auth.service';
import { CreateAuthDto } from '@app/auth/dto/create-auth.dto';
import { MqttAuthDto } from '@app/auth/dto/mqtt-auth.dto';
import { MQTT_WEB_CLIENT_ID } from '@app/constants';

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

  @Post('mqtt')
  mqttAuth(@Res() response: Response, @Body() { clientId }: MqttAuthDto) {
    if (clientId === MQTT_WEB_CLIENT_ID) return response.status(HttpStatus.OK).json({ result: 'allow' });
    return response.status(HttpStatus.OK).json({ result: 'ignore' });
  }
}
