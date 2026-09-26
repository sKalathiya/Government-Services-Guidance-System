import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PasswordChangeDto } from './dto/passwordChange.dto';

const SALT_ROUNDS = 12;

const DUMMY_PASSWORD_HASH =
  '$2b$12$xCxS8K4wE/qVMo5G2ERkHe/fu9Dyx7CxQcQs7LGq2lrCQzfPGePSS';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * @param registerDto - The register data
   * @returns The registered user
   */
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const isEmailExists = await this.userService.findbyEmail(email);
    if (isEmailExists) {
      throw new ConflictException('Email already exists!');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return await this.userService.createUser(name, email, passwordHash);
  }

  /**
   * Login a user
   * @param loginDto - The login credentials
   * @returns The logged in user and the token
   */

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findbyEmail(email);
    const isSamePassword = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !isSamePassword) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    const token = await this.generateToken(user.id, user.role);
    return { token, user };
  }

  /**
   * Get the current user
   * @param sub - The subject of the user
   * @param role - The role of the user
   * @returns The current user
   */
  async getCurrentUser(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }

  /**
   * Generate a JWT token
   * @param sub - The subject of the token
   * @param role - The role of the user
   * @returns The generated token
   */
  private async generateToken(sub: string, role: UserRole) {
    const payload = { sub, role };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  /**
   * Change the current user's password
   * @param passwordChangeDto - The password change data
   * @param sub - The id of the user
   * @returns The changed password message
   */
  async changePassword(passwordChangeDto: PasswordChangeDto, sub: string) {
    const { currentPassword, newPassword } = passwordChangeDto;
    const user = await this.userService.findById(sub);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isSamePassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isSamePassword) {
      throw new UnauthorizedException('Unauthorized');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userService.updatePassword(newPasswordHash, sub);
    return { message: 'Password changed successfully!' };
  }
}
