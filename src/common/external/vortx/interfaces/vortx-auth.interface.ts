export interface VortxAuthResponse {
  authenticated?: boolean;
  token: string;
  expiration?: string;
}

export interface CachedVortxToken {
  token: string;
  expiresAt: Date;
}
