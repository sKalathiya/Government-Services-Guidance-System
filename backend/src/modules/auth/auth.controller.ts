import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Get,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CookieOptions, Response } from 'express';
import {
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import {
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { CurrentUser } from '../security/decorators/currentuser.decorator';
import { UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../security/guards/jwt.auth.guard';
import { PasswordChangeDto } from './dto/passwordChange.dto';

@Controller('auth')
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get the cookie options
   * @returns The cookie options
   */
  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: ms(
        this.configService.get('JWT_EXPIRATION_TIME') as ms.StringValue,
      ),
    };
  }

  /**
   * Get the JWT cookie name
   * @returns The JWT cookie name
   */
  private getJwtCookieName(): string {
    return this.configService.get('JWT_COOKIE_NAME') as string;
  }

  /**
   * Get the current user
   * @param user - The user
   * @returns The current user
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user' })
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async me(@CurrentUser() user: { sub: string; role: UserRole }) {
    return this.authService.getCurrentUser(user.sub);
  }

  /**
   * Register a new user
   * @param registerDto - The register data
   * @returns The registered user
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterDto })
  @ApiConflictResponse({ description: 'Email already exists!' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Login a user
   * @param loginDto - The login data
   * @param res - The response object
   * @returns The logged in user
   */

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Invalid email or password!' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.login(loginDto);
    res.cookie(this.getJwtCookieName(), token, this.getCookieOptions());
    return user;
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Change the current user's password" })
  @ApiBody({ type: PasswordChangeDto })
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async changePassword(
    @Body() passwordChangeDto: PasswordChangeDto,
    @CurrentUser() { sub }: { sub: string },
  ) {
    return await this.authService.changePassword(passwordChangeDto, sub);
  }
}
