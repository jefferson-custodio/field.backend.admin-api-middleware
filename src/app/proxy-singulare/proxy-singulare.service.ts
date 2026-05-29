import { BadRequestException, Injectable } from '@nestjs/common';
import { SingulareClient } from 'src/common/external/singulare/singulare.client';
import { SingulareAuthService } from 'src/common/external/singulare/singulare-auth.service';
import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { MarketTypeEnum } from './enums/market-type.enum';
import { SchedulerReportTypeEnum } from './enums/scheduler-report-type.enum';
import { ProxySingulareFundAccessService } from './proxy-singulare.fund-access.service';

type ScheduleReportBody = {
  cnpjFundo: string;
  callbackUrl: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
};

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
    body: ScheduleReportBody,
  ): Promise<any> {
    const payload = this.buildScheduleReportPayload(tipoRelatorio, body);

    return this.singulareClient.makeRequest(
      `/queue/scheduler/report/${tipoRelatorio}`,
      'POST',
      payload,
    );
  }

  private buildScheduleReportPayload(
    tipoRelatorio: SchedulerReportTypeEnum,
    body: ScheduleReportBody,
  ) {
    const cnpjFundo = body.cnpjFundo?.replaceAll(/[./-]/g, '');
    if (!cnpjFundo) {
      throw new BadRequestException('cnpjFundo é obrigatório.');
    }

    if (!body.callbackUrl) {
      throw new BadRequestException('callbackUrl é obrigatório.');
    }

    switch (tipoRelatorio) {
      case SchedulerReportTypeEnum.FIDC_ESTOQUE:
        if (!body.date) {
          throw new BadRequestException(
            'date é obrigatório para fidc-estoque.',
          );
        }
        return {
          cnpjFundo,
          callbackUrl: body.callbackUrl,
          date: body.date,
        };

      case SchedulerReportTypeEnum.FIDC_AQUISICAO_CONSOLIDADA:
      case SchedulerReportTypeEnum.FIDC_LIQUIDADOS_BAIXADOS:
        if (!body.dateFrom || !body.dateTo) {
          throw new BadRequestException(
            'dateFrom e dateTo são obrigatórios para este relatório.',
          );
        }
        return {
          cnpjFundo,
          callbackUrl: body.callbackUrl,
          dateTo: body.dateTo,
        };

      case SchedulerReportTypeEnum.FIDC_MOVIMENTO_ABERTO:
        return {
          cnpjFundo,
          callbackUrl: body.callbackUrl,
        };

      default:
        throw new BadRequestException('tipoRelatorio inválido.');
    }
  }

  private getMarketReportType(): ReportTypeEnum {
    return ReportTypeEnum.ASSET;
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
