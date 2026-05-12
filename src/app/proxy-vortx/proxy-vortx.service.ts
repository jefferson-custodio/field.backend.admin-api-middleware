import { BadRequestException, Injectable } from '@nestjs/common';
import { VortxClient } from 'src/common/external/vortx/vortx.client';
import { AssetPortfolioResponseDto } from './dto/asset-portfolio.dto';
import { LiabilityShareholderMovementDto } from './dto/liability-shareholder-movement.dto';
import { LiabilityShareholderPositionDto } from './dto/liability-shareholder-position.dto';
import { ReportTypeEnum } from './enums/report-type.enum';

@Injectable()
export class ProxyVortxService {
  constructor(private readonly vortxClient: VortxClient) {}

  private getFirstDefinedValue(
    query: Record<string, any>,
    ...keys: string[]
  ): any {
    const key = keys.find((item) => query?.[item] !== undefined);
    return key ? query[key] : undefined;
  }

  private ensureStringValue(value: any, fieldName: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} é obrigatório.`);
    }

    return value.trim();
  }

  private normalizeDocument(value: any, fieldName: string): string {
    const document = this.ensureStringValue(value, fieldName).replace(
      /\D/g,
      '',
    );

    if (!document) {
      throw new BadRequestException(`${fieldName} é obrigatório.`);
    }

    return document;
  }

  private validateAndKeepCnpjFormat(value: any, fieldName: string): string {
    const rawValue = this.ensureStringValue(value, fieldName);
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!/^\d{14}$/.test(digitsOnly)) {
      throw new BadRequestException(`${fieldName} deve conter 14 dígitos.`);
    }

    return rawValue;
  }

  private validateDate(value: any, fieldName: string): string {
    const date = this.ensureStringValue(value, fieldName);
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      throw new BadRequestException(
        `${fieldName} deve estar no formato YYYY-MM-DD.`,
      );
    }

    const [yearText, monthText, dayText] = date.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException(`${fieldName} inválido.`);
    }

    return date;
  }

  private validateAndMapDateRange(query: Record<string, any>) {
    const startDate = this.getFirstDefinedValue(
      query,
      'startDate',
      'dataInicial',
    );
    const endDate = this.getFirstDefinedValue(query, 'endDate', 'dataFinal');

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate e endDate são obrigatórios.');
    }

    const validatedStartDate = this.validateDate(startDate, 'startDate');
    const validatedEndDate = this.validateDate(endDate, 'endDate');

    const start = new Date(`${validatedStartDate}T00:00:00.000Z`);
    const end = new Date(`${validatedEndDate}T00:00:00.000Z`);

    if (end < start) {
      throw new BadRequestException(
        'endDate não pode ser menor que startDate.',
      );
    }

    const diffInDays = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays > 100) {
      throw new BadRequestException(
        'O range de datas deve ter no máximo 100 dias.',
      );
    }

    const remainingQuery = { ...query };
    delete remainingQuery.startDate;
    delete remainingQuery.endDate;
    delete remainingQuery.dataInicial;
    delete remainingQuery.dataFinal;
    return {
      ...remainingQuery,
      dataInicial: validatedStartDate,
      dataFinal: validatedEndDate,
    };
  }

  private normalizeReceivablesShipmentType(value: any): string {
    const type = this.ensureStringValue(value, 'tipoRelatorio').toLowerCase();
    const allowedTypes = Object.values(ReportTypeEnum);

    if (!allowedTypes.includes(type as ReportTypeEnum)) {
      throw new BadRequestException(
        `tipoRelatorio deve ser um dos valores: ${allowedTypes.join(', ')}.`,
      );
    }

    return type;
  }

  private normalizeReceivablesShipmentQuery(
    fundDocument: string,
    query: Record<string, any>,
  ) {
    const normalizedQuery = this.validateAndMapDateRange(query);
    const tipoRelatorio = this.getFirstDefinedValue(
      query,
      'tipoRelatorio',
      'TipoRelatorio',
      'reportType',
    );

    return {
      ...normalizedQuery,
      cnpjFundo: this.validateAndKeepCnpjFormat(fundDocument, 'fundDocument'),
      tipoRelatorio: this.normalizeReceivablesShipmentType(tipoRelatorio),
    };
  }

  private normalizeReceivablesStockQuery(
    cnpjFundo: string,
    query: Record<string, any>,
  ) {
    const normalizedQuery: Record<string, any> = {};

    const cnpjFundoNormalized = this.normalizeDocument(cnpjFundo, 'cnpjFundo');
    if (!/^\d{14}$/.test(cnpjFundoNormalized)) {
      throw new BadRequestException('cnpjFundo deve conter 14 dígitos.');
    }

    const dateFields = [
      'DataReferencia',
      'DataEmissaoInicio',
      'DataEmissaoFim',
      'DataAquisicaoInicio',
      'DataAquisicaoFim',
      'DataVencimentoInicio',
      'DataVencimentoFim',
    ];

    dateFields.forEach((field) => {
      if (query[field]) {
        normalizedQuery[field] = this.validateDate(query[field], field);
      }
    });

    const documentFields = ['CedenteCnpjCpf', 'SacadoCnpjCpf'];
    documentFields.forEach((field) => {
      if (query[field]) {
        const normalized = String(query[field]).replace(/\D/g, '');
        if (!/^\d{11}$|^\d{14}$/.test(normalized)) {
          throw new BadRequestException(
            `${field} deve conter 11 (CPF) ou 14 (CNPJ) dígitos.`,
          );
        }
        normalizedQuery[field] = normalized;
      }
    });

    if (query.NumeroTitulo) {
      normalizedQuery.NumeroTitulo = String(query.NumeroTitulo).trim();
    }

    const integerFields = ['Take', 'Skip'];
    integerFields.forEach((field) => {
      if (query[field] !== undefined && query[field] !== null) {
        const value = Number(query[field]);
        if (!Number.isInteger(value) || value < 0) {
          throw new BadRequestException(
            `${field} deve ser um número inteiro não negativo.`,
          );
        }
        if (field === 'Take' && value > 100000) {
          throw new BadRequestException('Take deve ser no máximo 100000.');
        }
        normalizedQuery[field] = value;
      }
    });

    return normalizedQuery;
  }

  private validateSlashOrHyphenDate(value: any, fieldName: string): string {
    const rawDate = this.ensureStringValue(value, fieldName);
    const match = rawDate.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);

    if (!match) {
      throw new BadRequestException(
        `${fieldName} deve estar no formato YYYY/MM/DD.`,
      );
    }

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException(`${fieldName} inválido.`);
    }

    return `${yearText}-${monthText}-${dayText}`;
  }

  private normalizeCnpjFundos(value: any): string[] {
    let rawValues: string[] = [];

    if (Array.isArray(value)) {
      rawValues = value.map((item) => String(item));
    } else if (typeof value === 'string') {
      rawValues = value.includes(',') ? value.split(',') : [value];
    }

    const normalizedValues = rawValues
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => item.replace(/\D/g, ''));

    if (!normalizedValues.length) {
      throw new BadRequestException('cnpjFundos[] é obrigatório.');
    }

    const invalidValue = normalizedValues.find(
      (item) => !/^\d{14}$/.test(item),
    );
    if (invalidValue) {
      throw new BadRequestException(
        'cnpjFundos[] deve conter apenas CNPJ com 14 números.',
      );
    }

    return [...new Set(normalizedValues)];
  }

  private normalizeAssetPortfolioQuery(query: Record<string, any>) {
    const cnpjFundosValue = this.getFirstDefinedValue(
      query,
      'cnpjFundos[]',
      'cnpjFundos',
    );
    const dataCarteira = this.getFirstDefinedValue(query, 'dataCarteira');

    return {
      'cnpjFundos[]': this.normalizeCnpjFundos(cnpjFundosValue),
      dataCarteira: this.validateSlashOrHyphenDate(
        dataCarteira,
        'dataCarteira',
      ),
    };
  }

  private normalizeLiabilityShareholderPositionDate(value: any): string {
    const rawDate = this.ensureStringValue(value, 'dataPosicao');
    const match = rawDate.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/,
    );

    if (!match) {
      throw new BadRequestException(
        'dataPosicao deve estar no formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ.',
      );
    }

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('dataPosicao inválida.');
    }

    return `${yearText}-${monthText}-${dayText}`;
  }

  private normalizeLiabilityShareholderPositionQuery(
    query: Record<string, any>,
  ) {
    const cnpjFundo = this.getFirstDefinedValue(
      query,
      'cnpjFundo',
      'fundDocument',
    );
    const dataPosicao = this.getFirstDefinedValue(query, 'dataPosicao');

    return {
      cnpjFundo: this.validateAndKeepCnpjFormat(cnpjFundo, 'cnpjFundo'),
      dataPosicao: this.normalizeLiabilityShareholderPositionDate(dataPosicao),
    };
  }

  getReceivablesShipment(
    fundDocument: string,
    query: Record<string, any>,
  ): Promise<any> {
    const { tipoRelatorio, ...normalizedQuery } =
      this.normalizeReceivablesShipmentQuery(fundDocument, query);
    return this.vortxClient.getReceivablesShipment(
      tipoRelatorio,
      normalizedQuery,
    );
  }

  getReceivablesStock(
    cnpjFundo: string,
    query: Record<string, any>,
  ): Promise<any> {
    const cnpjFundoNormalized = this.normalizeDocument(cnpjFundo, 'cnpjFundo');
    const normalizedQuery = this.normalizeReceivablesStockQuery(
      cnpjFundo,
      query,
    );
    return this.vortxClient.getReceivablesStock(
      cnpjFundoNormalized,
      normalizedQuery,
    );
  }

  getAssetPortfolio(
    query: Record<string, any>,
  ): Promise<AssetPortfolioResponseDto[]> {
    const normalizedQuery = this.normalizeAssetPortfolioQuery(query);
    return this.vortxClient.getAssetPortfolio(normalizedQuery);
  }

  getLiabilityShareholderPosition(
    query: Record<string, any>,
  ): Promise<LiabilityShareholderPositionDto[]> {
    const normalizedQuery =
      this.normalizeLiabilityShareholderPositionQuery(query);
    return this.vortxClient.getLiabilityShareholderPosition(normalizedQuery);
  }

  getLiabilityShareholderMovement(
    query: Record<string, any>,
  ): Promise<LiabilityShareholderMovementDto[]> {
    const normalizedQuery = this.normalizeAssetPortfolioQuery(query);
    return this.vortxClient.getLiabilityShareholderMovement(normalizedQuery);
  }
}
