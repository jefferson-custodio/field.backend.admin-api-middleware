import { Injectable } from '@nestjs/common';
import { CONFIG } from 'src/config';
import { VortxAuthService } from './vortx-auth.service';

@Injectable()
export class VortxClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly authService: VortxAuthService) {
    this.baseUrl = CONFIG.vortx.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = CONFIG.vortx.timeoutMs;
  }

  private async makeRequest<T = any>(
    endpoint: string,
    queryParams?: Record<string, any>,
  ): Promise<T> {
    const token = await this.authService.getBearerToken();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const text = await response.text();
    let payload: any = text;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = text;
    }

    if (!response.ok) {
      const responseDetails =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
      throw new Error(
        `Vortx API request failed: ${response.status} ${response.statusText}${responseDetails ? ` - ${responseDetails}` : ''}`,
      );
    }

    return payload;
  }

  async getReceivablesShipment(
    tipoRelatorio: string,
    queryParams: Record<string, any>,
  ): Promise<any> {
    return this.makeRequest(
      `/Receivables/relatorios/${tipoRelatorio}`,
      queryParams,
    );
  }

  async getReceivablesStock(
    cnpjFundo: string,
    queryParams: Record<string, any>,
  ): Promise<any> {
    return this.makeRequest(
      `/Receivables/relatorios/estoque/${cnpjFundo}`,
      queryParams,
    );
  }

  async getAssetPortfolio(queryParams: Record<string, any>): Promise<any> {
    return this.makeRequest('/Carteira/buscar-carteira-json', queryParams);
  }

  async getLiabilityShareholderPosition(
    queryParams: Record<string, any>,
  ): Promise<any> {
    return this.makeRequest('/Carteira/posicaoCotista', queryParams);
  }

  async getLiabilityShareholderMovement(
    queryParams: Record<string, any>,
  ): Promise<any> {
    return this.makeRequest('/Carteira/movimentacaoCotista', queryParams);
  }
}
