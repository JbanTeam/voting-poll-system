import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { PollModule } from './modules/poll/poll.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UserModule,
    PollModule,
  ],
})
export class AppModule {}
