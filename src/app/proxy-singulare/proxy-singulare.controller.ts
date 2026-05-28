import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReportTypeEnum } from '../funds/enums/report-type.enum';
import { ReportType } from 'src/common/decorator/report-type.decorator';
import { ProxySingulareGuard } from './guards/proxy-singulare.guard';
import { ProxySingulareJwtGuard } from './guards/proxy-singulare-jwt.guard';
import { ProxySingulareService } from './proxy-singulare.service';
import { MarketTypeEnum } from './enums/market-type.enum';
import { SchedulerReportTypeEnum } from './enums/scheduler-report-type.enum';

@Controller('proxy-singulare')
@ApiTags('proxy-singulare')
@ApiBearerAuth()
export class ProxySingulareController {
  constructor(private readonly proxySingulareService: ProxySingulareService) {}

  @Get('fidc-custodia/report/aquisicao-consolidada')
  @UseGuards(ProxySingulareGuard)
  @ReportType(ReportTypeEnum.RECEIVABLES)
  @ApiOperation({ summary: 'Relatório Aquisição Consolidada - FIDC Custódia' })
  @ApiQuery({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'dataInicial', required: true, type: String })
  @ApiQuery({ name: 'dataFinal', required: true, type: String })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  async getConsolidatedAcquisition(
    @Query('cnpjFundo') cnpjFundo: string,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string,
  ): Promise<any> {
    return this.proxySingulareService.consolidatedAcquisitionReport(
      cnpjFundo,
      dataInicial,
      dataFinal,
    );
  }

  @Get('fidc-custodia/report/liquidados-baixados')
  @UseGuards(ProxySingulareGuard)
  @ReportType(ReportTypeEnum.RECEIVABLES)
  @ApiOperation({ summary: 'Relatório Liquidados Baixados - FIDC Custódia' })
  @ApiQuery({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'dataInicial', required: true, type: String })
  @ApiQuery({ name: 'dataFinal', required: true, type: String })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  async getLiquidatedWrittenOff(
    @Query('cnpjFundo') cnpjFundo: string,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string,
  ): Promise<any> {
    return this.proxySingulareService.liquidatedWrittenOffReport(
      cnpjFundo,
      dataInicial,
      dataFinal,
    );
  }

  @Get('fidc-custodia/report/liquidados-baixados/v2')
  @UseGuards(ProxySingulareGuard)
  @ReportType(ReportTypeEnum.RECEIVABLES)
  @ApiOperation({ summary: 'Relatório Liquidados Baixados v2 - FIDC Custódia' })
  @ApiQuery({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'dataInicial', required: true, type: String })
  @ApiQuery({ name: 'dataFinal', required: true, type: String })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  async getLiquidatedWrittenOffV2(
    @Query('cnpjFundo') cnpjFundo: string,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string,
  ): Promise<any> {
    return this.proxySingulareService.liquidatedWrittenOffV2Report(
      cnpjFundo,
      dataInicial,
      dataFinal,
    );
  }

  @Post('queue/scheduler/report/:tipoRelatorio')
  @UseGuards(ProxySingulareGuard)
  @ApiOperation({ summary: 'Agendamento de relatório - Singulare' })
  @ReportType(ReportTypeEnum.RECEIVABLES)
  @ApiParam({
    name: 'tipoRelatorio',
    required: true,
    enum: SchedulerReportTypeEnum,
  })
  @ApiBody({
    schema: {
      oneOf: [
        {
          type: 'object',
          required: ['cnpjFundo', 'callbackUrl', 'date'],
          properties: {
            cnpjFundo: { type: 'string' },
            callbackUrl: { type: 'string' },
            date: { type: 'string' },
          },
        },
        {
          type: 'object',
          required: ['cnpjFundo', 'callbackUrl', 'dateFrom', 'dateTo'],
          properties: {
            cnpjFundo: { type: 'string' },
            callbackUrl: { type: 'string' },
            dateFrom: { type: 'string' },
            dateTo: { type: 'string' },
          },
        },
        {
          type: 'object',
          required: ['cnpjFundo', 'callbackUrl'],
          properties: {
            cnpjFundo: { type: 'string' },
            callbackUrl: { type: 'string' },
          },
        },
      ],
    },
  })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  async scheduleReport(
    @Param('tipoRelatorio', new ParseEnumPipe(SchedulerReportTypeEnum))
    tipoRelatorio: SchedulerReportTypeEnum,
    @Body()
    body: {
      cnpjFundo: string;
      callbackUrl: string;
      date?: string;
      dateTo?: string;
      dateFrom?: string;
    },
  ): Promise<any> {
    return this.proxySingulareService.scheduleReport(tipoRelatorio, body);
  }

  @Get('netreport/report/market/:tipoDeMercado/:data')
  @UseGuards(ProxySingulareJwtGuard)
  @ApiOperation({ summary: 'Relatório de Mercado - Singulare' })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, enum: MarketTypeEnum })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  @ReportType(ReportTypeEnum.ASSET)
  async getMarketReport(
    @Query('date') date: string,
    @Query('type') type: MarketTypeEnum,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req['user']?.id;
    console.log('USER ID FOR MARKET REPORT', userId);
    console.log('REQUEST USER', req);
    return this.proxySingulareService.marketReport(date, type, userId);
  }
}
