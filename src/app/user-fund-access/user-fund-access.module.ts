import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserFundAccess } from './entities/user-fund-access.entity';
import { UserFundAccessService } from './user-fund-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFundAccess])],
  providers: [UserFundAccessService],
  exports: [UserFundAccessService],
})
export class UserFundAccessModule {}
