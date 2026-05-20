import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './app/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './common/external/pg/pg.connection';
import { AuthModule } from './app/auth/auth.module';
import { VersionsModule } from './app/versions/versions.module';
import { ProxyVortxModule } from './app/proxy-vortx/proxy-vortx.module';
import { FundsModule } from './app/funds/funds.module';
import { ProxySingulareModule } from './app/proxy-singulare/proxy-singulare.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    AuthModule,
    UsersModule,
    VersionsModule,
    FundsModule,
    ProxyVortxModule,
    ProxySingulareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
