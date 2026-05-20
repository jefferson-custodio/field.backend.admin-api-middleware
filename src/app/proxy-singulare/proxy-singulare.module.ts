import { Module } from '@nestjs/common';
import { FundsModule } from '../funds/funds.module';
import { SingulareModule } from 'src/common/external/singulare/singulare.module';
import { ProxySingulareController } from './proxy-singulare.controller';
import { ProxySingulareFundAccessService } from './proxy-singulare.fund-access.service';
import { ProxySingulareService } from './proxy-singulare.service';
import { ProxySingulareGuard } from './guards/proxy-singulare.guard';
import { ProxySingulareJwtGuard } from './guards/proxy-singulare-jwt.guard';

@Module({
  imports: [FundsModule, SingulareModule],
  controllers: [ProxySingulareController],
  providers: [
    ProxySingulareService,
    ProxySingulareGuard,
    ProxySingulareJwtGuard,
    // Corrigido: adicionar o provider ausente
    ProxySingulareFundAccessService,
  ],
  exports: [ProxySingulareService, ProxySingulareFundAccessService],
})
export class ProxySingulareModule {}
