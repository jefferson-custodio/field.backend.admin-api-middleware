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
        email: 'sistema@dition.com.br',
        password: '-',
        role: UserRoleEnum.SYSTEM,
        createdByUserId: 1,
      },
      {
        id: 2,
        name: 'Master Dition',
        email: 'master@dition.com.br',
        password:
          '$2b$10$7OArIn50pOxJvS7UZzC6DO0LzJB479Xx5EkmsKiv1QNmDyIi2hG4e', // 1V&#t0f7!vV@
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
