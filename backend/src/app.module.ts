import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from './config/config.env';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JurisdictionModule } from './modules/jurisdiction/jurisdiction.module';
import { UserModule } from './modules/user/user.module';
import { ServiceModule } from './modules/service/service.module';
import { StepModule } from './modules/step/step.module';
import { DocumentModule } from './modules/document/document.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '..', '.env')],
      validationSchema: envSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        database: configService.get('POSTGRES_DB'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        synchronize: false,
        autoLoadEntities: true,
        logging: configService.get('NODE_ENV') === 'development' ? true : false,
      }),
    }),
    JurisdictionModule,
    UserModule,
    ServiceModule,
    StepModule,
    DocumentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
