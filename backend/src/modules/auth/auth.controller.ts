import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { CookieOptions, Response } from 'express';
import {
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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
    res.cookie('access-token', token, this.getCookieOptions());
    return user;
  }
}
