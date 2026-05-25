import { BadRequestException, Injectable } from '@nestjs/common';
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

    if (!normalizedQuery['cnpjFundos[]'].length) {
      throw new BadRequestException(
        'Parametro obrigatorio cnpjFundos[] nao informado.',
      );
    }

    const hasInvalidFundDocument = normalizedQuery['cnpjFundos[]'].some(
      (value: string) => value.length !== 14,
    );

    if (hasInvalidFundDocument) {
      throw new BadRequestException(
        'Todos os itens de cnpjFundos[] devem conter 14 digitos numericos.',
      );
    }

    if (
      typeof normalizedQuery.dataCarteira !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(normalizedQuery.dataCarteira)
    ) {
      throw new BadRequestException(
        'Parametro obrigatorio dataCarteira deve estar no formato YYYY-MM-DD.',
      );
    }

    const requestedDate = new Date(`${normalizedQuery.dataCarteira}T00:00:00Z`);
    if (Number.isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Parametro dataCarteira invalido.');
    }

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    if (requestedDate < oneYearAgo) {
      throw new BadRequestException(
        'A Vortx nao permite consultar dataCarteira anterior a 1 ano.',
      );
    }

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
