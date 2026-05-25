import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from 'src/app/_base/base.guard';

@Injectable()
export class ProxySingulareJwtGuard extends BaseGuard {
  constructor(
    public jwtService: JwtService,
    public reflector: Reflector,
  ) {
    super(jwtService, reflector);
  }
}
