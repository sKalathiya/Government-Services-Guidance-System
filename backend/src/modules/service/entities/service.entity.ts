import {
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { Entity } from 'typeorm';
import { Index } from 'typeorm';
import Jurisdiction from '../../jurisdiction/entities/jurisdiction.entity.js';
import Step from '../../step/entities/step.entity.js';
import ServiceDocument from '../../document/entities/service-document.entity.js';
import FavouriteService from '../../user/entities/favourite-service.entity.js';

export enum FeesType {
  FREE = 'FREE',
  UNKNOWN = 'UNKNOWN',
  SPECIFIED = 'SPECIFIED',
}

@Entity('services')
export default class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: false })
  eligibility: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  sourceUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  officialUrl: string;

  @OneToMany(
    () => ServiceDocument,
    (requiredDocument) => requiredDocument.service,
  )
  requiredDocuments: ServiceDocument[];

  @Column({
    type: 'enum',
    enum: FeesType,
    enumName: 'FeesType',
    default: FeesType.UNKNOWN,
  })
  feesType: FeesType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  feesText: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processingTime: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @ManyToOne(() => Jurisdiction, (jurisdiction) => jurisdiction.services, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  jurisdiction: Jurisdiction;

  @OneToMany(() => Step, (step) => step.service)
  steps: Step[];

  @OneToMany(
    () => FavouriteService,
    (favouriteService) => favouriteService.service,
  )
  favouritedByUsers: FavouriteService[];

  @Column({ type: 'timestamp', nullable: false })
  lastVerifiedAt: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;
}
