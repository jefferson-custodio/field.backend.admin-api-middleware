import { Injectable } from '@nestjs/common';

@Injectable()
export class SingulareAuthService {
  private cachedToken: string | null = null;

  private normalizeToken(rawToken: unknown): string | null {
    if (typeof rawToken !== 'string') {
      return null;
    }

    const trimmed = rawToken.trim();

    if (!trimmed) {
      return null;
    }

    return trimmed.startsWith('Bearer ') ? trimmed.slice(7).trim() : trimmed;
  }

  private extractToken(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const root = payload as Record<string, unknown>;
    const prioritizedKeys = [
      'accessToken',
      'access_token',
      'token',
      'jwt',
      'id_token',
      'authorizationToken',
      'authToken',
    ];

    for (const key of prioritizedKeys) {
      const token = this.normalizeToken(root[key]);
      if (token) {
        return token;
      }
    }

    const visited = new Set<unknown>();
    const queue: unknown[] = [payload];

    while (queue.length) {
      const current = queue.shift();

      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }

      visited.add(current);

      const entries = Object.entries(current as Record<string, unknown>);

      for (const [key, value] of entries) {
        if (key.toLowerCase().includes('token')) {
          const token = this.normalizeToken(value);
          if (token) {
            return token;
          }
        }

        if (value && typeof value === 'object') {
          queue.push(value);
        }
      }
    }

    return null;
  }

  async getBearerToken(): Promise<string> {
    if (this.cachedToken) {
      return this.cachedToken;
    }

    const clientId = process.env.SINGULARE_CLIENT_ID;
    const clientSecret = process.env.SINGULARE_CLIENT_SECRET;
    const baseUrl = (process.env.SINGULARE_BASE_URL || '').replace(/\/+$/, '');

    if (!clientId || !clientSecret) {
      throw new Error(
        'SINGULARE_CLIENT_ID and SINGULARE_CLIENT_SECRET must be configured.',
      );
    }

    if (!baseUrl) {
      throw new Error('SINGULARE_BASE_URL must be configured.');
    }

    const path = `${baseUrl}/painel/token/api`;
    const basicCredentials = Buffer.from(
      `${clientId}:${clientSecret}`,
    ).toString('base64');

    const response = await fetch(path, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${basicCredentials}`,
      },
      signal: AbortSignal.timeout(
        Number(process.env.SINGULARE_TIMEOUT_MS || 15000),
      ),
    });
    console.log('### TOKEN RESPONSE ####', response);
    const text = await response.text();
    let body: any = text;
    console.log('### TOKEN RESPONSE BODY ####', body);
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = text;
    }

    if (!response.ok) {
      const details = typeof body === 'string' ? body : JSON.stringify(body);
      throw new Error(
        `Singulare auth failed: ${response.status} ${response.statusText}${details ? ` - ${details}` : ''}`,
      );
    }

    const token = this.extractToken(body);

    if (!token || typeof token !== 'string') {
      const shape =
        body && typeof body === 'object' ? Object.keys(body).join(', ') : body;
      throw new Error(
        `Invalid authentication response from Singulare API. Payload shape: ${shape || 'empty'}`,
      );
    }

    this.cachedToken = token;
    return this.cachedToken;
  }
}
