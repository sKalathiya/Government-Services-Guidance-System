import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Service from '../../service/entities/service.entity.js';

@Entity('steps')
export default class Step {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  step_text: string;

  @Column({ type: 'integer', nullable: false })
  step_order: number;

  @ManyToOne(() => Service, (service) => service.steps, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  service: Service;
}
