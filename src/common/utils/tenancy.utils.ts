import {
  Connection,
  DataSource,
  DataSourceOptions,
  createConnection,
  getConnectionManager,
} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import pgConfig from '../external/pg/pg.connection';

export const getTenantSource = (tenantId: number): DataSource => {
  const connectionName = getTenantName(tenantId);
  //   const connectionManager = getConnectionManager();

  //   if (connectionManager.has(connectionName)) {
  //     const connection = connectionManager.get(connectionName);
  //     return Promise.resolve(
  //       connection.isConnected ? connection : connection.connect(),
  //     );
  //   }

  return new DataSource({
    ...pgConfig,
    name: connectionName,
    database: connectionName,
  } as DataSourceOptions);
};

export const getTenantName = (tenantId: number): string => {
  return `enquad_tenant_${tenantId}`;
};
