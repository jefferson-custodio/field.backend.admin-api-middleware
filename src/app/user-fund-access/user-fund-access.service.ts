import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { FundAccess } from './entities/user-fund-access.entity';

@Injectable()
export class UserFundAccessService {
  constructor(
    @InjectRepository(FundAccess)
    private readonly fundAccessRepository: Repository<FundAccess>,
  ) {}

  async hasAccess(
    userId: number,
    fundDocument: string,
    reportType: ReportTypeEnum,
  ): Promise<boolean> {
    const access = await this.fundAccessRepository
      .createQueryBuilder('access')
      .innerJoin('access.user', 'user')
      .innerJoin('access.fund', 'fund')
      .where('user.id = :userId', { userId })
      .andWhere('fund.externalCode = :fundDocument', { fundDocument })
      .andWhere('access.reportType = :reportType', { reportType })
      .getOne();

    return !!access;
  }
}
