import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Service from './entities/service.entity';
import { JurisdictionModule } from '../jurisdiction/jurisdiction.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    JurisdictionModule,
    DocumentModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
