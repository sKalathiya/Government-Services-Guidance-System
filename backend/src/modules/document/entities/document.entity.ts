import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ServiceDocument from './service-document.entity';

@Entity('documents')
export default class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false, unique: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  example: string | null;

  @OneToMany(
    () => ServiceDocument,
    (serviceDocument) => serviceDocument.document,
  )
  usedInServices: ServiceDocument[];
}
