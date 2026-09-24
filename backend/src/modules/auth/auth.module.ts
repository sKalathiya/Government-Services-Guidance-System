import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from '../security/security.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, SecurityModule],
})
export class AuthModule {}
