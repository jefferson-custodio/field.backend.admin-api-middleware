import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../app/users/entities/user.entity';
import { UserRoleEnum } from '../../common/enums/user-role.enum';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async shouldRun(): Promise<boolean> {
    const count = await this.userRepository.count();
    return count === 0;
  }

  async seed(): Promise<any> {
    if (!(await this.shouldRun())) {
      return;
    }
    await this.userRepository.insert([
      {
        id: 1,
        name: 'Sistema',
        email: 'sistema@fieldasset.com.br',
        password: '-',
        role: UserRoleEnum.SYSTEM,
        createdByUserId: 1,
      },
      {
        id: 2,
        name: 'Master Field',
        email: 'master@fieldasset.com.br',
        password:
          '$2b$10$ry6UX9lOUb2zTBcKh/FPf.addLNTvYrpBm07DS4hAZB6lyzqckRee', // 1V&#t0f7!vV@
        role: UserRoleEnum.MASTER,
        createdByUserId: 1,
      },
    ]);

    await this.userRepository.query(
      `SELECT setval(pg_get_serial_sequence('"user"', 'id'), (SELECT MAX("id") FROM "user"))`,
    );
  }

  async drop(): Promise<any> {
    return this.userRepository.query(
      'TRUNCATE TABLE "user" RESTART IDENTITY CASCADE',
    );
  }
}
