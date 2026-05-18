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
    return this.vortxClient.getAssetPortfolio(query);
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
