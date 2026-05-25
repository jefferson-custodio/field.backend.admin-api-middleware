import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';

import { Fund } from '../../app/funds/entities/fund.entity';
import { UserFundAccess } from '../../app/user-fund-access/entities/user-fund-access.entity';
import { User } from '../../app/users/entities/user.entity';
import { ReportTypeEnum } from '../../app/funds/enums/report-type.enum';

@Injectable()
export class UserFundAccessSeeder implements Seeder {
  private readonly targetUserEmail = 'master@dition.com.br';

  private readonly targetFundExternalCode = '62728923000111';

  private readonly isProduction = process.env.NODE_ENV === 'production';

  private readonly reportTypes = [
    ReportTypeEnum.MARKET,
    ReportTypeEnum.LIQUIDADOS_BAIXADOS,
    ReportTypeEnum.LIQUIDADOS_BAIXADOS_V2,
    ReportTypeEnum.MOVIMENTO_ABERTO,
    ReportTypeEnum.LIABILITY_PORTFOLIO,
  ];

  constructor(
    @InjectRepository(UserFundAccess)
    private readonly userFundAccessRepository: Repository<UserFundAccess>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
  ) {}

  async shouldRun(): Promise<boolean> {
    if (this.isProduction) {
      return false;
    }

    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return false;
    }

    const existingAccesses = await this.userFundAccessRepository
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
    if (this.isProduction) {
      return;
    }

    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return;
    }

    const existingAccesses = await this.userFundAccessRepository
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

    await this.userFundAccessRepository.query(
      `
        INSERT INTO "user_fund_access" ("createdAt", "updatedAt", "reportType", "userId", "fundId")
        VALUES ${valuesClause}
      `,
      parameters,
    );
  }

  async drop(): Promise<any> {
    if (this.isProduction) {
      return;
    }

    const user = await this.userRepository.findOne({
      where: { email: this.targetUserEmail },
    });
    const fund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    if (!user || !fund) {
      return;
    }

    await this.userFundAccessRepository.query(
      `
        DELETE FROM "user_fund_access"
        WHERE "userId" = $1
          AND "fundId" = $2
          AND "reportType" = ANY($3)
      `,
      [user.id, fund.id, this.reportTypes],
    );
  }
}
