import { Module } from '@nestjs/common';
import { VortxModule } from 'src/common/external/vortx/vortx.module';
import { ProxyVortxController } from './proxy-vortx.controller';
import { ProxyVortxGuard } from './guards/proxy-vortx.guard';
import { ProxyVortxService } from './proxy-vortx.service';
import { UserFundAccessModule } from '../user-fund-access/user-fund-access.module';

@Module({
  imports: [UserFundAccessModule, VortxModule],
  controllers: [ProxyVortxController],
  providers: [ProxyVortxService, ProxyVortxGuard],
  exports: [ProxyVortxService],
})
export class ProxyVortxModule {}
