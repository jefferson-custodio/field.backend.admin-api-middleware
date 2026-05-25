import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';

import { Fund } from '../../app/funds/entities/fund.entity';
import { FundAccess } from '../../app/user-fund-access/entities/user-fund-access.entity';
import { User } from '../../app/users/entities/user.entity';
import { ReportTypeEnum } from '../../app/funds/enums/report-type.enum';

@Injectable()
export class UserFundAccessSeeder implements Seeder {
  private readonly targetUserEmail = 'master@dition.com.br';

  private readonly targetFundExternalCode = '58396668000180';

  private readonly reportTypes = [
    ReportTypeEnum.MARKET,
    ReportTypeEnum.LIQUIDADOS_BAIXADOS,
    ReportTypeEnum.LIQUIDADOS_BAIXADOS_V2,
    ReportTypeEnum.MOVIMENTO_ABERTO,
    ReportTypeEnum.LIABILITY_PORTFOLIO,
  ];

  constructor(
    @InjectRepository(FundAccess)
    private readonly fundAccessRepository: Repository<FundAccess>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
  ) {}

  async shouldRun(): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return false;
    }

    const existingAccesses = await this.fundAccessRepository
      .createQueryBuilder('access')
      .select('access.reportType', 'reportType')
      .where('access.userId = :userId', { userId: user.id })
      .andWhere('access.fundId = :fundId', { fundId: fund.id })
      .andWhere('access.reportType IN (:...reportTypes)', {
        reportTypes: this.reportTypes,
      })
      .getRawMany<{ reportType: ReportTypeEnum }>();

    return existingAccesses.length < this.reportTypes.length;
  }

  async seed(): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return;
    }

    const existingAccesses = await this.fundAccessRepository
      .createQueryBuilder('access')
      .select('access.reportType', 'reportType')
      .where('access.userId = :userId', { userId: user.id })
      .andWhere('access.fundId = :fundId', { fundId: fund.id })
      .andWhere('access.reportType IN (:...reportTypes)', {
        reportTypes: this.reportTypes,
      })
      .getRawMany<{ reportType: ReportTypeEnum }>();

    const existingReportTypes = new Set(
      existingAccesses.map((access) => access.reportType),
    );
    const missingReportTypes = this.reportTypes.filter(
      (reportType) => !existingReportTypes.has(reportType),
    );

    if (!missingReportTypes.length) {
      return;
    }

    const valuesClause = missingReportTypes
      .map(
        (_, index) =>
          `(now(), now(), $${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`,
      )
      .join(', ');
    const parameters = missingReportTypes.flatMap((reportType) => [
      reportType,
      user.id,
      fund.id,
    ]);

    await this.fundAccessRepository.query(
      `
        INSERT INTO "fund_access" ("createdAt", "updatedAt", "reportType", "userId", "fundId")
        VALUES ${valuesClause}
      `,
      parameters,
    );
  }

  async drop(): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return;
    }

    await this.fundAccessRepository.query(
      `
        DELETE FROM "fund_access"
        WHERE "userId" = $1
          AND "fundId" = $2
          AND "reportType" = ANY($3)
      `,
      [user.id, fund.id, this.reportTypes],
    );
  }
}