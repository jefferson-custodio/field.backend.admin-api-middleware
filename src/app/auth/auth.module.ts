import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthLoginAttempt } from './entities/auth_login_attempt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CONFIG } from 'src/config';
import { MailerModule } from 'src/common/external/mailer/mailer.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuthLoginAttempt]),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: CONFIG.security.jwtKey,
      signOptions: { expiresIn: '12h' },
    }),
    PassportModule.register({ defaultStrategy: CONFIG.security.jwtExpiresIn }),
    MailerModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
