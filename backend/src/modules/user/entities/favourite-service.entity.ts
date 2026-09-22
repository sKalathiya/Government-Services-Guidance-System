import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import Service from '../../service/entities/service.entity';
import { User } from './user.entity';

@Entity('favourite_services')
@Unique(['user', 'service'])
export default class FavouriteService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.favouritedServices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Service, (service) => service.favouritedByUsers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  service: Service;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;
}
