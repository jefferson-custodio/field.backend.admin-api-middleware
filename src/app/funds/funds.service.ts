import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '../_base/base.service';
import { VersionsService } from '../versions/versions.service';
import { Fund } from './entities/fund.entity';
import { FundAccess } from './entities/user-fund-access.entity';
import { ReportTypeEnum } from './enums/report-type.enum';

@Injectable()
export class FundsService extends BaseService<Fund> {
  constructor(
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
    @InjectRepository(FundAccess)
    private readonly fundAccessRepository: Repository<FundAccess>,
    versionsService: VersionsService,
  ) {
    super(
      fundRepository,
      {
        searchableColumns: ['name'],
        relations: ['fundAccesses'],
        sortableColumns: ['id'],
      },
      versionsService,
    );
  }

  protected override queryBuilderWithAccessFilter(alias: string) {
    return this.fundRepository.createQueryBuilder(alias);
  }

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
