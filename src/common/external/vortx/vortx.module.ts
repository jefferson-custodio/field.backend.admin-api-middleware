import { Module } from '@nestjs/common';
import { VortxAuthService } from './vortx-auth.service';
import { VortxClient } from './vortx.client';

@Module({
  providers: [VortxAuthService, VortxClient],
  exports: [VortxClient],
})
export class VortxModule {}
