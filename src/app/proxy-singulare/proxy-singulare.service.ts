import { Injectable } from '@nestjs/common';
import { SingulareClient } from 'src/common/external/singulare/singulare.client';
import { SingulareAuthService } from 'src/common/external/singulare/singulare-auth.service';
import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { MarketTypeEnum } from './enums/market-type.enum';
import { SchedulerReportTypeEnum } from './enums/scheduler-report-type.enum';
import { ProxySingulareFundAccessService } from './proxy-singulare.fund-access.service';

@Injectable()
export class ProxySingulareService {
  constructor(
    private readonly singulareClient: SingulareClient,
    private readonly singulareAuthService: SingulareAuthService,
    private readonly proxySingulareFundAccessService: ProxySingulareFundAccessService,
  ) {}

  probe(): Promise<{ ok: true }> {
    return this.singulareClient.probe();
  }

  async debugToken(): Promise<{
    ok: true;
    tokenPrefix: string;
    tokenLength: number;
  }> {
    const token = await this.singulareAuthService.getBearerToken();
    console.log('######## DEBUG TOKEN ########', token);
    return {
      ok: true,
      tokenPrefix: token.slice(0, 12),
      tokenLength: token.length,
    };
  }

  async consolidatedAcquisitionReport(
    cnpjFundo: string,
    dataInicial: string,
    dataFinal: string,
  ): Promise<any> {
    return this.singulareClient.makeRequest(
      `/fidc-custodia/report/aquisicao-consolidada/${cnpjFundo.replaceAll(/[./-]/g, '')}/${dataInicial}/${dataFinal}`,
    );
  }

  async liquidatedWrittenOffReport(
    cnpjFundo: string,
    dataInicial: string,
    dataFinal: string,
  ): Promise<any> {
    return this.singulareClient.makeRequest(
      `/fidc-custodia/report/liquidados-baixados/${cnpjFundo.replaceAll(/[./-]/g, '')}/${dataInicial}/${dataFinal}`,
    );
  }

  async liquidatedWrittenOffV2Report(
    cnpjFundo: string,
    dataInicial: string,
    dataFinal: string,
  ): Promise<any> {
    return this.singulareClient.makeRequest(
      `/fidc-custodia/report/liquidados-baixados/v2/${cnpjFundo.replaceAll(/[./-]/g, '')}/${dataInicial}/${dataFinal}`,
    );
  }

  async scheduleReport(
    tipoRelatorio: SchedulerReportTypeEnum,
    cnpjFundo: string,
    callbackUrl: string,
  ): Promise<any> {
    return this.singulareClient.makeRequest(
      `/queue/scheduler/report/${tipoRelatorio}`,
      'POST',
      {
        cnpjFundo: cnpjFundo.replaceAll(/[./-]/g, ''),
        callbackUrl,
      },
    );
  }

  private getMarketReportType(): ReportTypeEnum {
    return ReportTypeEnum.MARKET;
  }

  async marketReport(
    date: string,
    type: MarketTypeEnum,
    userId: number,
  ): Promise<any> {
    const response = await this.singulareClient.makeRequest(
      `/netreport/report/market/${type}/${date}`,
    );

    if (!response?.relatórios?.[type]) {
      return response;
    }

    const filteredFunds =
      await this.proxySingulareFundAccessService.filterByFundAccess(
        response.relatórios[type],
        userId,
        this.getMarketReportType(),
      );

    return {
      ...response,
      relatórios: {
        ...response.relatórios,
        [type]: filteredFunds,
      },
    };
  }
}
