import { Injectable } from '@nestjs/common';
import { SingulareAuthService } from './singulare-auth.service';

@Injectable()
export class SingulareClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly authService: SingulareAuthService) {
    this.baseUrl = (process.env.SINGULARE_BASE_URL || '').replace(/\/+$/, '');
    this.timeoutMs = Number(process.env.SINGULARE_TIMEOUT_MS || 15000);
  }

  async probe(): Promise<{ ok: true }> {
    return { ok: true };
  }

  async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('SINGULARE_BASE_URL is not configured.');
    }
    console.log('#### REQUEST #####', this.baseUrl + endpoint);
    const token = await this.authService.getBearerToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': token,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
        `Singulare API request failed: ${response.status} ${response.statusText}${responseDetails ? ` - ${responseDetails}` : ''}`,
      );
    }

    return payload as T;
  }
}
