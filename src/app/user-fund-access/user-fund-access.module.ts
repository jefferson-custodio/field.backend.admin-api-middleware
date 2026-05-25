import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FundAccess } from './entities/user-fund-access.entity';
import { UserFundAccessService } from './user-fund-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([FundAccess])],
  providers: [UserFundAccessService],
  exports: [UserFundAccessService],
})
export class UserFundAccessModule {}
