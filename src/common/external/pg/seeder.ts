import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './pg.connection';
import { seeder } from 'nestjs-seeder';

import { Fund } from '../../../app/funds/entities/fund.entity';
import { FundAccess } from '../../../app/user-fund-access/entities/user-fund-access.entity';
import { UserSeeder } from '../../../db/seeds/users.seed';
import { UserFundAccessSeeder } from '../../../db/seeds/user-fund-access.seed';
import { User } from '../../../app/users/entities/user.entity';

seeder({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forFeature([User, Fund, FundAccess]),
  ],
}).run([UserSeeder, UserFundAccessSeeder]);
