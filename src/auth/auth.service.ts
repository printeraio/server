import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import { type TokenPayload } from '@app/types';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  validateToken(token: string) {
    return this.jwtService.verify<TokenPayload>(token, { secret: process.env.JWT_SECRET_KEY });
  }

  async hashPassword(password: string) {
    return hash(password, 10);
  }

  async confirmPassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    const isPasswordCorrect = await this.confirmPassword(password, user.password);
    if (!isPasswordCorrect) throw new UnauthorizedException();

    const payload: TokenPayload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET_KEY });
    return { accessToken, refreshToken };
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const hashedPassword = await this.hashPassword(password);
    const user = await this.userService.create(email, hashedPassword, firstName, lastName);
    const payload: TokenPayload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET_KEY });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
