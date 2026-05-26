import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { Injectable } from '@nestjs/common';
import { UserFundAccessService } from '../user-fund-access/user-fund-access.service';

@Injectable()
export class ProxySingulareFundAccessService {
  constructor(private readonly userFundAccessService: UserFundAccessService) {}

  async canViewFund(
    userId: number,
    fundDocument: string,
    reportType: ReportTypeEnum,
  ): Promise<boolean> {
    return this.userFundAccessService.hasAccess(
      userId,
      fundDocument,
      reportType,
    );
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
