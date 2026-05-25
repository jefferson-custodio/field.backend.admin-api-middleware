import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './pg.connection';
import { seeder } from 'nestjs-seeder';

import { Fund } from '../../../app/funds/entities/fund.entity';
import { UserFundAccess } from '../../../app/user-fund-access/entities/user-fund-access.entity';
import { DevFundSeeder } from '../../../db/seeds/dev-fund.seed';
import { UserSeeder } from '../../../db/seeds/users.seed';
import { UserFundAccessSeeder } from '../../../db/seeds/user-fund-access.seed';
import { User } from '../../../app/users/entities/user.entity';

const isProduction = process.env.NODE_ENV === 'production';
const seeders = isProduction
  ? [UserSeeder]
  : [UserSeeder, DevFundSeeder, UserFundAccessSeeder];

seeder({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forFeature([User, Fund, UserFundAccess]),
  ],
}).run(seeders);
