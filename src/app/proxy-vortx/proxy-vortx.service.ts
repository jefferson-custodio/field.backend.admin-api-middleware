import { Injectable } from '@nestjs/common';
import { VortxClient } from 'src/common/external/vortx/vortx.client';
import { AssetPortfolioResponseDto } from './dto/asset-portfolio.dto';
import { LiabilityShareholderMovementDto } from './dto/liability-shareholder-movement.dto';
import { LiabilityShareholderPositionDto } from './dto/liability-shareholder-position.dto';

@Injectable()
export class ProxyVortxService {
  constructor(private readonly vortxClient: VortxClient) {}

  getReceivablesShipment(query: Record<string, any>): Promise<any> {
    const { tipoRelatorio, ...restQuery } = query;
    const cnpjFundo = restQuery.cnpjFundo || restQuery.fundDocument;

    return this.vortxClient.getReceivablesShipment(
      String(tipoRelatorio).toLowerCase(),
      {
        ...restQuery,
        cnpjFundo,
      },
    );
  }

  getReceivablesStock(
    cnpjFundo: string,
    query: Record<string, any>,
  ): Promise<any> {
    return this.vortxClient.getReceivablesStock(cnpjFundo, query);
  }

  getAssetPortfolio(
    query: Record<string, any>,
  ): Promise<AssetPortfolioResponseDto[]> {
    const rawCnpjFundos =
      query['cnpjFundos[]'] ??
      query.cnpjFundos ??
      query.cnpjFundo ??
      query.fundDocument;
    const cnpjFundos = Array.isArray(rawCnpjFundos)
      ? rawCnpjFundos
      : rawCnpjFundos !== undefined
        ? [rawCnpjFundos]
        : [];

    const rawDataCarteira =
      query.dataCarteira ?? query.dataPosicao ?? query.dataReferencia;
    const normalizedDataCarteira =
      typeof rawDataCarteira === 'string'
        ? rawDataCarteira.split('T')[0].replace(/\//g, '-')
        : rawDataCarteira;

    const normalizedQuery: Record<string, any> = {
      ...query,
      'cnpjFundos[]': cnpjFundos
        .map((item) => String(item).replace(/\D/g, ''))
        .filter((item) => item),
      dataCarteira: normalizedDataCarteira,
    };

    delete normalizedQuery.cnpjFundos;
    delete normalizedQuery.cnpjFundo;
    delete normalizedQuery.fundDocument;
    delete normalizedQuery.dataPosicao;
    delete normalizedQuery.dataReferencia;
    return this.vortxClient.getAssetPortfolio(normalizedQuery);
  }

  getLiabilityShareholderPosition(
    query: Record<string, any>,
  ): Promise<LiabilityShareholderPositionDto[]> {
    return this.vortxClient.getLiabilityShareholderPosition(query);
  }

  getLiabilityShareholderMovement(
    query: Record<string, any>,
  ): Promise<LiabilityShareholderMovementDto[]> {
    return this.vortxClient.getLiabilityShareholderMovement(query);
  }
}
