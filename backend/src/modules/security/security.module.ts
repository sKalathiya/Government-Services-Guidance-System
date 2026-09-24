import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { RoleGuard } from './guards/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
    }),
  ],
  controllers: [SecurityController],
  providers: [SecurityService, JwtAuthGuard, RoleGuard],
  exports: [JwtModule, JwtAuthGuard, RoleGuard],
})
export class SecurityModule {}
