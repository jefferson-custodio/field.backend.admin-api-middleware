import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { BaseGuard } from '../_base/base.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RecoveryEmailDto } from './dto/recovery-email.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post()
  async login(
    @Body() authDto: AuthDto,
    @Ip() ip: string,
  ): Promise<{ accessToken: string }> {
    const authData = await this.authService.login(authDto, ip);

    if (!authData)
      throw new HttpException(
        'Email e/ou Senha incorretos...',
        HttpStatus.UNAUTHORIZED,
      );
    return authData;
  }

  @Get('/me')
  @UseGuards(BaseGuard)
  @Roles(UserRoleEnum.MASTER, UserRoleEnum.MANAGER)
  @ApiBearerAuth()
  async me(): Promise<User> {
    const user = await this.usersService.findById(global.USER.id);
    return user;
  }

  @Post('/send-recover-email')
  async sendRecoverPasswordEmail(
    @Body() body: RecoveryEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.sendRecoverPasswordEmail(body.email);
    return {
      message: 'Foi enviado um email com instruções para resetar sua senha',
    };
  }

  @Patch('/reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(token, changePasswordDto);

    return {
      message: 'Senha alterada com sucesso',
    };
  }
}
