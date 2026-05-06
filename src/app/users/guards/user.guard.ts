import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from 'src/app/_base/base.guard';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class UserGuard extends BaseGuard {
  constructor(
    public jwtService: JwtService,
    public reflector: Reflector,
  ) {
    super(jwtService, reflector);
  }

  async extraValidations(user: IJwtPayload): Promise<boolean> {
    // escreva aqui suas regras de validação adicionais
    return true;
  }
}
