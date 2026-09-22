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
}
