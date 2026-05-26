import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './entities/fund.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Fund])],
  providers: [FundsService],
  exports: [FundsService],
})
export class FundsModule {}
