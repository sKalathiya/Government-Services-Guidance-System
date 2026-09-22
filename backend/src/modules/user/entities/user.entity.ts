import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import FavouriteService from './favourite-service.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'UserRole',
    nullable: false,
  })
  role: UserRole;

  @OneToMany(
    () => FavouriteService,
    (favouriteService) => favouriteService.user,
  )
  favouritedServices: FavouriteService[];

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updatedAt: Date;
}
