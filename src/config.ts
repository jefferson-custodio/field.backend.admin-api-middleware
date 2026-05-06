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
    recoveryPasswordBaseURL: 'http://dition.com.br/recovery-password',
  },
  mail: {
    from: '"Dition" <no-reply@dition.com.br>',
    host: String(process.env.MAIL_HOST),
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
};
