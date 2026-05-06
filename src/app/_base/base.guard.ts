import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorator/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CONFIG } from 'src/config';

@Injectable()
export class BaseGuard implements CanActivate {
  constructor(
    public jwtService: JwtService,
    public reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: IJwtPayload = await this.jwtService.verifyAsync(token, {
        secret: CONFIG.security.jwtKey,
      });

      request['user'] = payload;
      global.USER = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return (
      this.validateRoles(context) &&
      (await this.extraValidations(request['user'], context))
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  validateRoles(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }

  async extraValidations(
    user: IJwtPayload,
    context: ExecutionContext,
  ): Promise<boolean> {
    return true;
  }
}
