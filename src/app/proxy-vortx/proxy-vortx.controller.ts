import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AssetPortfolioResponseDto } from './dto/asset-portfolio.dto';
import { ReportTypeEnum as AccessReportTypeEnum } from '../funds/enums/report-type.enum';
import { ReportTypeEnum as ShipmentReportTypeEnum } from './enums/report-type.enum';

import { LiabilityShareholderMovementDto } from './dto/liability-shareholder-movement.dto';
import { LiabilityShareholderPositionDto } from './dto/liability-shareholder-position.dto';
import { ReportType } from 'src/common/decorator/report-type.decorator';
import { ProxyVortxGuard } from './guards/proxy-vortx.guard';
import { ProxyVortxService } from './proxy-vortx.service';

@Controller('proxy-vortx')
@ApiTags('proxy-vortx')
@ApiBearerAuth()
@UseGuards(ProxyVortxGuard)
export class ProxyVortxController {
  constructor(private readonly proxyVortxService: ProxyVortxService) {}

  @Get('relatorios/estoque/:cnpjFundo')
  @ApiOperation({ summary: 'Receivables stock report' })
  @ApiParam({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'DataReferencia', required: false, type: String })
  @ApiQuery({ name: 'NumeroTitulo', required: false, type: String })
  @ApiQuery({ name: 'CedenteCnpjCpf', required: false, type: String })
  @ApiQuery({ name: 'SacadoCnpjCpf', required: false, type: String })
  @ApiQuery({ name: 'DataEmissaoInicio', required: false, type: String })
  @ApiQuery({ name: 'DataEmissaoFim', required: false, type: String })
  @ApiQuery({ name: 'DataAquisicaoInicio', required: false, type: String })
  @ApiQuery({ name: 'DataAquisicaoFim', required: false, type: String })
  @ApiQuery({ name: 'DataVencimentoInicio', required: false, type: String })
  @ApiQuery({ name: 'DataVencimentoFim', required: false, type: String })
  @ApiQuery({ name: 'Take', required: false, type: Number })
  @ApiQuery({ name: 'Skip', required: false, type: Number })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  @ReportType(AccessReportTypeEnum.RECEIVABLE)
  getReceivablesStock(
    @Param('cnpjFundo') cnpjFundo: string,
    @Query() query: Record<string, any>,
  ): Promise<any> {
    return this.proxyVortxService.getReceivablesStock(cnpjFundo, query);
  }

  @Get('relatorios/:tipoRelatorio')
  @ApiOperation({ summary: 'Receivables shipment reports' })
  @ApiParam({
    name: 'tipoRelatorio',
    required: true,
    enum: ShipmentReportTypeEnum,
  })
  @ApiQuery({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'dataInicial', required: true, type: String })
  @ApiQuery({ name: 'dataFinal', required: true, type: String })
  @ApiOkResponse({ schema: { type: 'object', additionalProperties: true } })
  @ReportType(AccessReportTypeEnum.RECEIVABLE)
  getReceivablesShipment(
    @Param('tipoRelatorio') tipoRelatorio: ShipmentReportTypeEnum,
    @Query() query: Record<string, any>,
  ): Promise<any> {
    return this.proxyVortxService.getReceivablesShipment({
      ...query,
      tipoRelatorio,
    });
  }

  @Get('carteira/buscar-carteira-json')
  @ApiOperation({ summary: 'Asset portfolio JSON report' })
  @ApiQuery({
    name: 'cnpjFundos[]',
    required: true,
    type: String,
    isArray: true,
  })
  @ApiQuery({ name: 'dataCarteira', required: true, type: String })
  @ApiOkResponse({ type: AssetPortfolioResponseDto, isArray: true })
  @ReportType(AccessReportTypeEnum.ASSET)
  getAssetPortfolio(
    @Query() query: Record<string, any>,
  ): Promise<AssetPortfolioResponseDto[]> {
    return this.proxyVortxService.getAssetPortfolio(query);
  }

  @Get('carteira/posicaoCotista')
  @ApiOperation({ summary: 'Liability shareholder position report' })
  @ApiQuery({ name: 'cnpjFundo', required: true, type: String })
  @ApiQuery({ name: 'dataPosicao', required: true, type: String })
  @ApiOkResponse({ type: LiabilityShareholderPositionDto, isArray: true })
  @ReportType(AccessReportTypeEnum.SHAREHOLDER)
  getLiabilityShareholderPosition(
    @Query() query: Record<string, any>,
  ): Promise<LiabilityShareholderPositionDto[]> {
    return this.proxyVortxService.getLiabilityShareholderPosition(query);
  }

  @Get('carteira/movimentacaoCotista')
  @ApiOperation({ summary: 'Liability shareholder movement report' })
  @ReportType(AccessReportTypeEnum.SHAREHOLDER)
  @ApiQuery({
    name: 'cnpjFundos[]',
    required: true,
    type: String,
    isArray: true,
  })
  @ApiQuery({ name: 'dataCarteira', required: true, type: String })
  @ApiOkResponse({ type: LiabilityShareholderMovementDto, isArray: true })
  @ReportType(AccessReportTypeEnum.SHAREHOLDER)
  getLiabilityShareholderMovement(
    @Query() query: Record<string, any>,
  ): Promise<LiabilityShareholderMovementDto[]> {
    return this.proxyVortxService.getLiabilityShareholderMovement(query);
  }
}
