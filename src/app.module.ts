import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true, load: [databaseConfig] }),
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
