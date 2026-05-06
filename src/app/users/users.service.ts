import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository } from 'typeorm';
import { BaseService } from '../_base/base.service';
import { User } from './entities/user.entity';
import { VersionsService } from '../versions/versions.service';
import { hashPassword } from 'src/common/utils/password.utils';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { getCurrentUser } from 'src/common/utils/user.utils';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    versionsService: VersionsService,
  ) {
    super(
      userRepository,
      {
        searchableColumns: ['name'],
        filterableColumns: {
          name: true,
          email: true,
          role: true,
          document: true,
        },
        sortableColumns: ['id'],
      },
      versionsService,
    );
  }

  protected override queryBuilderWithAccessFilter(alias: string) {
    const qb = this.userRepository.createQueryBuilder(alias);

    const currentUser = getCurrentUser();
    if (currentUser.role != UserRoleEnum.MASTER) {
      qb.andWhere('id = :id', { id: currentUser.id });
    }

    return qb;
  }

  async findByEmail(
    email: string,
    relations?: string[],
    select?: FindOptionsSelect<User>,
  ): Promise<User> {
    return this.userRepository.findOne({ relations, where: { email }, select });
  }

  async findByRecoveryToken(recoveryToken: string): Promise<User> {
    return this.userRepository.findOne({ where: { recoveryToken } });
  }

  async changePassword(id: number, password: string) {
    await this.update(id, {
      password: await hashPassword(password.trim()),
      recoveryToken: null,
    });
  }
}
