import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({ secret: process.env.JWT_SECRET || 'secret', signOptions: { expiresIn: '1h' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
