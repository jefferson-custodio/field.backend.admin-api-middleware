import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { CONFIG } from '../../../config';
import { DataSource, DataSourceOptions } from 'typeorm';

const config = {
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: CONFIG.database.host,
  port: CONFIG.database.port,
  username: CONFIG.database.username,
  password: CONFIG.database.password,
  database: CONFIG.database.database,
  logging: false,
  synchronize: false,
  entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../../db/migrations/**/*{.ts,.js}'],
  subscribers: ['src/subscriber/**/*{.js}'],
  ssl: CONFIG.database.ssl,
  extra: {
    poolSize: 50,
    connectionTimeoutMillis: 2000,
    query_timeout: 300000,
    statement_timeout: 300000,
  },
};

export const connectionSource = new DataSource(config as DataSourceOptions);

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<any> => {
    return config;
  },
};

export default config;
