import 'dotenv/config';

export const CONFIG = {
  app: {
    swaggerTitle: 'DITION API',
    swaggerPath: 'doc',
    port: Number(process.env.APP_PORT || 3000),
    corsOrigins: process.env.CORS_ORIGINS || '*',
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true',
  },
  security: {
    jwtKey: process.env.JWT_KEY,
    jwtExpiresIn: '6h',
    recoverPasswordTokenExpirationMinutes: 15,
    passwordExpirationDays: 90,
    recoveryPasswordBaseURL: 'http://fieldasset.com.br/recovery-password',
  },
  mail: {
    from: '"Field" <no-reply@fieldasset.com.br>',
    host: String(process.env.MAIL_HOST),
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  vortx: {
    baseUrl: process.env.VORTX_BASE_URL || 'https://vxapi.vortx.com.br',
    apiKey: process.env.VORTX_API_KEY || '',
    username: process.env.VORTX_USERNAME || '',
    password: process.env.VORTX_PASSWORD || '',
    timeoutMs: Number(process.env.VORTX_TIMEOUT_MS || 15000),
  },
};
