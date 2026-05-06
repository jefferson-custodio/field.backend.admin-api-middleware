import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './pg.connection';
import { seeder } from 'nestjs-seeder';

import { UserSeeder } from '../../../db/seeds/users.seed';
import { User } from '../../../app/users/entities/user.entity';

seeder({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forFeature([User]),
  ],
}).run([UserSeeder]);
