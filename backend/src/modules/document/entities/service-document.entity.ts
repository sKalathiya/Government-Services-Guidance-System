import { ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import Service from '../../service/entities/service.entity';
import Document from './document.entity';
import { Entity } from 'typeorm';

@Entity('service_documents')
@Unique(['document', 'service'])
export default class ServiceDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, (document) => document.usedInServices, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  document: Document;

  @ManyToOne(() => Service, (service) => service.requiredDocuments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  service: Service;
}
