import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './entities/fund.entity';
import { FundAccess } from './entities/user-fund-access.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Fund, FundAccess])],
  providers: [FundsService],
  exports: [FundsService],
})
export class FundsModule {}
