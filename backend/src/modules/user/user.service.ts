import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email
   * @param email - The email of the user
   * @returns The user if found, otherwise null
   */
  async findbyEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Create a new user
   * @param name - The name of the user
   * @param email - The email of the user
   * @param passwordHash - The hash of the user's password
   * @param role - The role of the user
   * @returns The created user
   */
  async createUser(
    name: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.USER,
  ) {
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      role,
    });
    return await this.userRepository.save(user);
  }
}
