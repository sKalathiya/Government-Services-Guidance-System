import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateuser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by id
   * @param id - The id of the user
   * @returns The user if found, otherwise null
   */
  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

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

  /**
   * Update a user
   * @param updateUserDto - The data to update the user with
   * @param userId - The id of the user to update
   * @returns The updated user
   */
  async updateUser(updateUserDto: UpdateUserDto, userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { name, email } = updateUserDto;
    if (name === undefined && email === undefined) {
      throw new BadRequestException('At least one field is required');
    }
    if (email && email !== user.email) {
      const existingUser = await this.findbyEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }
    return await this.userRepository.save({
      ...user,
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
    });
  }

  /**
   * Update a user's password
   * @param passwordHash - The hash of the user's password
   * @param userId - The id of the user to update
   * @returns The updated user
   */
  async updatePassword(passwordHash: string, userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return await this.userRepository.save({ ...user, passwordHash });
  }

  /**
   * Delete a user
   * @param userId - The id of the user to delete
   * @returns The deleted user
   */
  async deleteUser(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.delete({ id: userId });
  }
}
