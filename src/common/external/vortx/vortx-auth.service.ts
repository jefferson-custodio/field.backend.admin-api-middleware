import { Injectable } from '@nestjs/common';
import { CONFIG } from 'src/config';
import {
  CachedVortxToken,
  VortxAuthResponse,
} from './interfaces/vortx-auth.interface';

@Injectable()
export class VortxAuthService {
  private cachedToken: CachedVortxToken | null = null;
  private refreshPromise: Promise<string> | null = null;

  private isVortxAuthResponse(payload: unknown): payload is VortxAuthResponse {
    return typeof payload === 'object' && payload !== null;
  }

  async getBearerToken(): Promise<string> {
    if (this.hasValidCachedToken()) {
      return this.cachedToken!.token;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.authenticate().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private hasValidCachedToken(): boolean {
    if (!this.cachedToken) {
      return false;
    }

    const refreshThresholdMs = 30 * 1000;
    return (
      this.cachedToken.expiresAt.getTime() - Date.now() > refreshThresholdMs
    );
  }

  private async authenticate(): Promise<string> {
    if (!CONFIG.vortx.username || !CONFIG.vortx.password) {
      throw new Error('Vortx credentials are not configured.');
    }

    const baseUrl = CONFIG.vortx.baseUrl.replace(/\/+$/, '');
    const login = CONFIG.vortx.username.replace(/\D/g, '');
    const response = await fetch(`${baseUrl}/vxlogin/api/user/AuthUserApi`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: CONFIG.vortx.password,
        login,
      }),
      signal: AbortSignal.timeout(CONFIG.vortx.timeoutMs),
    });

    const text = await response.text();
    let payload: unknown = text;

    try {
      payload = text ? (JSON.parse(text) as VortxAuthResponse) : {};
    } catch {
      payload = text;
    }

    if (!response.ok) {
      const responseDetails =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
      throw new Error(
        `Vortx auth failed: ${response.status} ${response.statusText}${responseDetails ? ` - ${responseDetails}` : ''}`,
      );
    }

    if (!this.isVortxAuthResponse(payload) || !payload.token) {
      throw new Error('Vortx auth returned an invalid payload.');
    }

    const expiresAt = this.parseExpiration(payload.expiration);
    this.cachedToken = {
      token: payload.token,
      expiresAt,
    };

    return payload.token;
  }

  private parseExpiration(expiration?: string): Date {
    if (!expiration) {
      return new Date(Date.now() + 55 * 60 * 1000);
    }

    const parsedDate = new Date(expiration.replace(' ', 'T'));

    if (Number.isNaN(parsedDate.getTime())) {
      return new Date(Date.now() + 55 * 60 * 1000);
    }

    return parsedDate;
  }
}
