import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { FundsService } from '../funds/funds.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxySingulareFundAccessService {
  constructor(private readonly fundService: FundsService) {}

  async canViewFund(
    userId: number,
    fundDocument: string,
    reportType: ReportTypeEnum,
  ): Promise<boolean> {
    return this.fundService.hasAccess(userId, fundDocument, reportType);
  }

  async filterByFundAccess(
    funds: any[],
    userId: number,
    reportType: ReportTypeEnum,
  ): Promise<any[]> {
    const filteredFunds = [];
    for (const fund of funds) {
      const hasAccess = await this.canViewFund(
        userId,
        fund.cpfDoCliente,
        reportType,
      );
      if (hasAccess) {
        filteredFunds.push(fund);
      }
    }

    return filteredFunds;
  }
}
