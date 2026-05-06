import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginAttempt } from './entities/auth_login_attempt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLoginAttemptResultEnum } from './enums/auth-login-attempt-result.enum';
import { CONFIG } from 'src/config';
import { randomBytes } from 'crypto';
import { MailerService } from 'src/common/external/mailer/mailer.service';
import { MailTemplates } from 'src/common/external/mailer/enums/templates.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(AuthLoginAttempt)
    private authLoginAttemptRepository: Repository<AuthLoginAttempt>,
    private mailerService: MailerService,
  ) {}

  async login(
    authDto: AuthDto,
    ip: string,
  ): Promise<{ accessToken: string } | null> {
    const user = await this.validateUser(authDto.email, authDto.password, ip);
    if (!user) return null;

    return { accessToken: this.getToken(user) };
  }

  async validateUser(
    email: string,
    password: string,
    ip: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, undefined, {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      passwordLastUpdatedAt: true,
    });

    if (!user) return null;

    if (await user?.comparePassword(password)) {
      await this.logAuth(user, AuthLoginAttemptResultEnum.AUTHORIZED, ip);
      return user;
    }

    if (AuthService.isPasswordExpired(user)) {
      await this.logAuth(user, AuthLoginAttemptResultEnum.REJECTED, ip);

      throw new UnauthorizedException('Senha está expirada.', {
        description: 'password_expired',
      });
    }

    await this.logAuth(user, AuthLoginAttemptResultEnum.REJECTED, ip);
    return null;
  }

  getToken(user: User): string {
    const payload: IJwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async sendRecoverPasswordEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email, undefined, {
      id: true,
      name: true,
      email: true,
      role: true,
      recoveryToken: true,
      recoveryTokenCreatedAt: true,
      passwordLastUpdatedAt: true,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const recoveryToken = randomBytes(32).toString('hex');
    this.usersService.update(user.id, {
      recoveryToken: recoveryToken,
      recoveryTokenCreatedAt: new Date(),
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperação de senha',
      template: MailTemplates.RECOVER_PASSWORD,
      context: {
        ...user,
        url: CONFIG.security.recoveryPasswordBaseURL,
        token: recoveryToken,
      },
    });
  }

  async resetPassword(
    recoveryToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findByRecoveryToken(recoveryToken);

    if (!user) {
      throw new NotFoundException('Token inválido.');
    }

    if (await user?.comparePassword(changePasswordDto.password)) {
      throw new BadRequestException(
        'A nova senha precisa ser diferente da senha anterior.',
      );
    }

    if (!AuthService.isRecoveryTokenExpired(user)) {
      throw new UnauthorizedException('Token expirado.');
    }

    try {
      await this.changePassword(user, changePasswordDto);
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { password, passwordConfirmation } = changePasswordDto;

    if (password != passwordConfirmation)
      throw new UnprocessableEntityException('As senhas são diferentes!');

    await this.usersService.changePassword(user.id, password);
    this.logger.log(
      `Senha atualizada para o usuário id = ${user.id} | name = ${user.name} `,
    );
  }

  private async logAuth(
    user: User,
    result: AuthLoginAttemptResultEnum,
    ip: string,
  ) {
    const authLoginAttempt = new AuthLoginAttempt();
    authLoginAttempt.user = user;
    authLoginAttempt.result = result;
    authLoginAttempt.ip = ip;
    return await this.authLoginAttemptRepository.save(authLoginAttempt);
  }

  static isRecoveryTokenExpired = (user: User) => {
    const now = new Date();
    const datePlusMinutes = user.recoveryTokenCreatedAt;
    datePlusMinutes.setMinutes(
      datePlusMinutes.getMinutes() +
        CONFIG.security.recoverPasswordTokenExpirationMinutes,
    );
    return datePlusMinutes > now;
  };

  static isPasswordExpired = (user: User) => {
    const now = new Date();
    const datePlusDays = user.passwordLastUpdatedAt;
    datePlusDays.setDate(
      user.passwordLastUpdatedAt.getDate() +
        CONFIG.security.passwordExpirationDays,
    );

    return now > datePlusDays;
  };
}
