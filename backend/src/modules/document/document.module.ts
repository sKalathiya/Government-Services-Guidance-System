import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Document from './entities/document.entity';
import ServiceDocument from './entities/service-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, ServiceDocument])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
