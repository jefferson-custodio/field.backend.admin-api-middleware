import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';

import { Fund } from '../../app/funds/entities/fund.entity';

@Injectable()
export class DevFundSeeder implements Seeder {
  private readonly targetFundExternalCode = '62728923000111';

  private readonly targetFundName = 'Fundo 62728923000111';

  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor(
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
  ) {}

  async shouldRun(): Promise<boolean> {
    if (this.isProduction) {
      return false;
    }

    const existingFund = await this.fundRepository.findOne({
      where: { externalCode: this.targetFundExternalCode },
    });

    return !existingFund;
  }

  async seed(): Promise<any> {
    if (this.isProduction || !(await this.shouldRun())) {
      return;
    }

    await this.fundRepository.insert({
      name: this.targetFundName,
      externalCode: this.targetFundExternalCode,
      isActive: true,
    });
  }

  async drop(): Promise<any> {
    if (this.isProduction) {
      return;
    }

    await this.fundRepository.query(
      `
        DELETE FROM "user_fund_access"
        WHERE "fundId" IN (
          SELECT "id"
          FROM "fund"
          WHERE "externalCode" = $1
        )
      `,
      [this.targetFundExternalCode],
    );

    await this.fundRepository.delete({
      externalCode: this.targetFundExternalCode,
    });
  }
}
