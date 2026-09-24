import {
  ConflictException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserRole } from '../user/entities/user.entity';

const validPayload = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'Password@123',
};

const credentials = {
  email: validPayload.email,
  password: validPayload.password,
};

const token = 'signed.jwt.token';
const JWT_SECRET = 'a'.repeat(40);

const registeredUser = Object.assign(new User(), {
  id: '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60',
  name: validPayload.name,
  email: validPayload.email,
  passwordHash: '$2b$12$C6UzMDM.H6dfI/f/IKcEe.MWMbC0nMxCTvKrfGnLBe5vFrIrCVeR2',
  role: UserRole.USER,
  createdAt: new Date('2026-09-22T12:00:00.000Z'),
  updatedAt: new Date('2026-09-22T12:00:00.000Z'),
});

const serializedUser = {
  id: registeredUser.id,
  name: registeredUser.name,
  email: registeredUser.email,
  role: UserRole.USER,
  createdAt: registeredUser.createdAt.toISOString(),
  updatedAt: registeredUser.updatedAt.toISOString(),
};

describe('AuthController', () => {
  let app: INestApplication<App>;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    changePassword: jest.Mock;
  };
  let jwt: JwtService;

  /** Boots the controller with the same pipe main.ts applies. */
  async function createApp(nodeEnv = 'development') {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return nodeEnv;
              if (key === 'JWT_COOKIE_NAME') return 'access-token';
              return '15m';
            }),
          },
        },
      ],
    }).compile();

    jwt = module.get(JwtService);
    const created = module.createNestApplication<INestApplication<App>>();
    created.setGlobalPrefix('api/v1');
    created.use(cookieParser());
    created.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    return created.init();
  }

  function loginRequest(body: Record<string, unknown> = credentials) {
    return request(app.getHttpServer()).post('/api/v1/auth/login').send(body);
  }

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(registeredUser),
      login: jest.fn().mockResolvedValue({ token, user: registeredUser }),
      changePassword: jest
        .fn()
        .mockResolvedValue({ message: 'Password changed successfully!' }),
    };
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app.get(AuthController)).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('returns the created user without the password hash', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(serializedUser);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('sets no cookie, so register does not log the user in', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload);

      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('passes the normalized email to the service', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, email: '  John.Doe@Example.COM  ' });

      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john.doe@example.com' }),
      );
    });

    it('returns 400 for a weak password without reaching the service', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, password: 'password' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('returns 400 for extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, extra: 'extra' });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['property extra should not exist']),
      );
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('propagates a duplicate email as 409', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('Email already exists!'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload);

      expect(response.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 and the user without the password hash', async () => {
      const response = await loginRequest();

      expect(response.status).toBe(200);
      expect(response.body).toEqual(serializedUser);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('keeps the token out of the response body', async () => {
      const response = await loginRequest();

      expect(JSON.stringify(response.body)).not.toContain(token);
    });

    it('sets the token in an HttpOnly, SameSite cookie', async () => {
      const response = await loginRequest();
      const [cookie] = response.headers['set-cookie'];

      expect(cookie).toContain(`access-token=${token}`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
    });

    it('expires the cookie with the token, in seconds', async () => {
      const response = await loginRequest();
      const [cookie] = response.headers['set-cookie'];

      // ms('15m') is 900000ms, which Express writes as Max-Age=900.
      expect(cookie).toContain('Max-Age=900');
    });

    it('omits Secure outside production so local http still works', async () => {
      const response = await loginRequest();
      const [cookie] = response.headers['set-cookie'];

      expect(cookie).not.toContain('Secure');
    });

    it('marks the cookie Secure in production', async () => {
      await app.close();
      app = await createApp('production');

      const response = await loginRequest();
      const [cookie] = response.headers['set-cookie'];

      expect(cookie).toContain('Secure');
    });

    it('passes the normalized email to the service', async () => {
      await loginRequest({ ...credentials, email: '  John.Doe@Example.COM  ' });

      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john.doe@example.com' }),
      );
    });

    it('does not enforce the register password policy on login', async () => {
      const response = await loginRequest({
        ...credentials,
        password: 'legacy-weak-password',
      });

      expect(response.status).toBe(200);
      expect(authService.login).toHaveBeenCalled();
    });

    it('returns 400 for a missing password without reaching the service', async () => {
      const response = await loginRequest({ email: credentials.email });

      expect(response.status).toBe(400);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('returns 400 for extra fields', async () => {
      const response = await loginRequest({ ...credentials, role: 'ADMIN' });

      expect(response.status).toBe(400);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('sets no cookie when the credentials are rejected', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password!'),
      );

      const response = await loginRequest();

      expect(response.status).toBe(401);
      expect(response.headers['set-cookie']).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toMatch(/not found|no user/i);
      expect(response.body.message).toBe('Invalid email or password!');
    });
  });

  describe('PATCH /auth/password', () => {
    async function cookieFor(sub = registeredUser.id) {
      const signed = await jwt.signAsync({ sub, role: UserRole.USER });
      return `access-token=${signed}`;
    }

    it('changes the password for the user in the cookie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/password')
        .set('Cookie', await cookieFor())
        .send({
          currentPassword: 'Password@123',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(200);
      expect(authService.changePassword).toHaveBeenCalledWith(
        expect.objectContaining({ newPassword: 'NewPassword@123' }),
        registeredUser.id,
      );
    });

    it('rejects a weak new password before the service', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/password')
        .set('Cookie', await cookieFor())
        .send({ currentPassword: 'Password@123', newPassword: 'password' });

      expect(response.status).toBe(400);
      expect(authService.changePassword).not.toHaveBeenCalled();
    });

    it('returns 401 with no cookie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/password')
        .send({
          currentPassword: 'Password@123',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(401);
      expect(authService.changePassword).not.toHaveBeenCalled();
    });
  });
});
