import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SingulareAuthToken } from 'src/app/proxy-singulare/entities/singulare-auth-token.entity';
import { decrypt256, encrypt256 } from 'src/common/utils/crypto.utils';
import { Repository } from 'typeorm';

@Injectable()
export class SingulareAuthService {
  private static readonly PROVIDER = 'singulare';
  private cachedToken: { token: string; expiresAt: Date } | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    @InjectRepository(SingulareAuthToken)
    private readonly singulareAuthTokenRepository: Repository<SingulareAuthToken>,
  ) {}

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
    if (this.hasValidCachedToken()) {
      return this.cachedToken!.token;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.resolveBearerToken().finally(() => {
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

  private async resolveBearerToken(): Promise<string> {
    const persistedToken = await this.getPersistedToken();

    if (persistedToken) {
      this.cachedToken = persistedToken;
      return persistedToken.token;
    }

    return this.authenticateAndPersistToken();
  }

  private async getPersistedToken(): Promise<{
    token: string;
    expiresAt: Date;
  } | null> {
    const storedToken = await this.singulareAuthTokenRepository.findOne({
      where: { provider: SingulareAuthService.PROVIDER },
    });

    if (!storedToken) {
      return null;
    }

    if (storedToken.expiresAt.getTime() <= Date.now() + 30 * 1000) {
      return null;
    }

    let token: string;

    try {
      token = decrypt256(storedToken.encryptedToken);
    } catch (err: unknown) {
      console.error(err);
    }

    return {
      token,
      expiresAt: storedToken.expiresAt,
    };
  }

  private async authenticateAndPersistToken(): Promise<string> {
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
    const text = await response.text();
    let body: any = text;
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

    const expiresAt = this.extractExpiresAt(body);
    const encryptedToken = encrypt256(token);

    await this.singulareAuthTokenRepository.upsert(
      {
        provider: SingulareAuthService.PROVIDER,
        encryptedToken,
        expiresAt,
        updatedAt: new Date(),
      },
      ['provider'],
    );

    this.cachedToken = { token, expiresAt };
    return token;
  }

  private extractExpiresAt(payload: unknown): Date {
    if (!payload || typeof payload !== 'object') {
      return new Date(Date.now() + 55 * 60 * 1000);
    }

    const root = payload as Record<string, unknown>;
    const directExpiration =
      root.expiration ?? root.expiresAt ?? root.expires_at ?? root.expireAt;

    if (typeof directExpiration === 'string') {
      const parsedDate = new Date(directExpiration.replace(' ', 'T'));
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    const directSeconds = root.expiresIn ?? root.expires_in;
    if (typeof directSeconds === 'number' && Number.isFinite(directSeconds)) {
      return new Date(Date.now() + directSeconds * 1000);
    }

    return new Date(Date.now() + 55 * 60 * 1000);
  }
}
