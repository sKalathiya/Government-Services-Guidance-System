import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';

const JWT_SECRET = 'a'.repeat(40);
const callerId = '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60';
const otherId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const caller = Object.assign(new User(), {
  id: callerId,
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  passwordHash: '$2b$12$existinghash',
  role: UserRole.USER,
  createdAt: new Date('2026-09-22T12:00:00.000Z'),
  updatedAt: new Date('2026-09-22T12:00:00.000Z'),
});

describe('UserController', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  let userService: {
    updateUser: jest.Mock;
    deleteUser: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      updateUser: jest.fn().mockResolvedValue(caller),
      deleteUser: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET })],
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'JWT_COOKIE_NAME' ? 'access-token' : '15m',
            ),
          },
        },
      ],
    }).compile();

    jwt = module.get(JwtService);
    app = module.createNestApplication<INestApplication<App>>();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  async function cookieFor(sub: string) {
    const token = await jwt.signAsync({ sub, role: UserRole.USER });
    return `access-token=${token}`;
  }

  it('should be defined', () => {
    expect(app.get(UserController)).toBeDefined();
  });

  describe('PATCH /user/me', () => {
    it('updates the caller and hides the password hash', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .set('Cookie', await cookieFor(callerId))
        .send({ name: '  Jane Doe  ' });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe' }),
        callerId,
      );
    });

    it('rejects a body that tries to set role or userId', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .set('Cookie', await cookieFor(callerId))
        .send({ name: 'Jane Doe', role: 'ADMIN', userId: otherId });

      expect(response.status).toBe(400);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('returns 401 with no cookie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(401);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /user/me', () => {
    it('deletes the caller even if the body names someone else', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/user/me')
        .set('Cookie', await cookieFor(callerId))
        .send({ userId: otherId });

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(userService.deleteUser).toHaveBeenCalledWith(callerId);
      expect(userService.deleteUser).not.toHaveBeenCalledWith(otherId);
    });

    it('returns 401 with no cookie', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/api/v1/user/me',
      );

      expect(response.status).toBe(401);
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });
  });
});
