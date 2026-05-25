import { Module } from '@nestjs/common';
import { SingulareAuthService } from './singulare-auth.service';
import { SingulareClient } from './singulare.client';

@Module({
  providers: [SingulareAuthService, SingulareClient],
  exports: [SingulareClient, SingulareAuthService],
})
export class SingulareModule {}
