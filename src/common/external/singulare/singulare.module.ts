import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SingulareAuthToken } from 'src/app/proxy-singulare/entities/singulare-auth-token.entity';
import { SingulareAuthService } from './singulare-auth.service';
import { SingulareClient } from './singulare.client';

@Module({
  imports: [TypeOrmModule.forFeature([SingulareAuthToken])],
  providers: [SingulareAuthService, SingulareClient],
  exports: [SingulareClient, SingulareAuthService],
})
export class SingulareModule {}
