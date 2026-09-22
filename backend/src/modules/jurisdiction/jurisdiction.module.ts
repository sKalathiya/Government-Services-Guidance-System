import { Module } from '@nestjs/common';
import { JurisdictionService } from './jurisdiction.service';
import { JurisdictionController } from './jurisdiction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Jurisdiction from './entities/jurisdiction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Jurisdiction])],
  controllers: [JurisdictionController],
  providers: [JurisdictionService],
})
export class JurisdictionModule {}
