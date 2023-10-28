import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AuthModule } from '@app/auth/auth.module';
import { ClientModule } from '@app/client/client.module';
import { DbConfig } from '@app/config';
import { GlobalModule } from '@app/global/global.module';
import { PrinterModule } from '@app/printer/printer.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DbConfig],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '5d' },
    }),
    GlobalModule,
    UserModule,
    PrinterModule,
    ClientModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
