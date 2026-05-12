import { Module } from '@nestjs/common';
import { FundsModule } from '../funds/funds.module';
import { VortxModule } from 'src/common/external/vortx/vortx.module';
import { ProxyVortxController } from './proxy-vortx.controller';
import { ProxyVortxGuard } from './guards/proxy-vortx.guard';
import { ProxyVortxService } from './proxy-vortx.service';

@Module({
  imports: [FundsModule, VortxModule],
  controllers: [ProxyVortxController],
  providers: [ProxyVortxService, ProxyVortxGuard],
  exports: [ProxyVortxService],
})
export class ProxyVortxModule {}
