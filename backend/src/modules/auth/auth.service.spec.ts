import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

const registerDto: RegisterDto = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'Password@123',
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findbyEmail: jest.Mock;
    createUser: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    userService = {
      findbyEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn(
        (
          name: string,
          email: string,
          passwordHash: string,
          role: UserRole = UserRole.USER,
        ) =>
          Object.assign(new User(), {
            id: '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60',
            name,
            email,
            passwordHash,
            role,
          }),
      ),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('stores a bcrypt hash instead of the plaintext password', async () => {
      await service.register(registerDto);

      const passwordHash: string = userService.createUser.mock.calls[0][2];
      expect(passwordHash).not.toBe(registerDto.password);
      expect(passwordHash).toMatch(/^\$2[aby]\$/);
      await expect(
        bcrypt.compare(registerDto.password, passwordHash),
      ).resolves.toBe(true);
    });

    it('salts the hash so the same password never repeats', async () => {
      await service.register(registerDto);
      await service.register(registerDto);

      const [first, second] = userService.createUser.mock.calls;
      expect(first[2]).not.toBe(second[2]);
    });

    it('creates the account as USER and never passes a role', async () => {
      const user = await service.register(registerDto);

      expect(userService.createUser.mock.calls[0]).toHaveLength(3);
      expect(user.role).toBe(UserRole.USER);
    });

    it('rejects a duplicate email without creating a user', async () => {
      userService.findbyEmail.mockResolvedValue(
        Object.assign(new User(), { email: registerDto.email }),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('issues no token, so register does not log the user in', async () => {
      await service.register(registerDto);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const credentials = {
      email: registerDto.email,
      password: registerDto.password,
    };

    /** Registers, then makes the resulting user the one login will find. */
    async function registerAndFind() {
      const registered = await service.register(registerDto);
      userService.findbyEmail.mockResolvedValue(registered);
      return registered;
    }

    it('accepts the password that register hashed', async () => {
      const registered = await registerAndFind();

      await expect(service.login(credentials)).resolves.toEqual({
        user: registered,
        token: 'signed.jwt.token',
      });
    });

    it('signs only the id and role into the token', async () => {
      const registered = await registerAndFind();
      await service.login(credentials);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
      const payload = jwtService.signAsync.mock.calls[0][0];
      expect(Object.keys(payload).sort()).toEqual(['role', 'sub']);
      expect(payload).toEqual({ sub: registered.id, role: UserRole.USER });
    });

    it('never claims a role the user does not have', async () => {
      await registerAndFind();
      await service.login(credentials);

      expect(jwtService.signAsync.mock.calls[0][0].role).not.toBe(
        UserRole.ADMIN,
      );
    });

    it('rejects a wrong password and issues no token', async () => {
      await registerAndFind();

      await expect(
        service.login({ ...credentials, password: 'Wrong@12345' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('cannot be used to tell a wrong password from an unknown email', async () => {
      await registerAndFind();
      const wrongPassword = await service
        .login({ ...credentials, password: 'Wrong@12345' })
        .catch((error: UnauthorizedException) => error.getResponse());

      userService.findbyEmail.mockResolvedValue(null);
      const unknownEmail = await service
        .login({ ...credentials, email: 'nobody@example.com' })
        .catch((error: UnauthorizedException) => error.getResponse());

      expect(unknownEmail).toEqual(wrongPassword);
    });

    it('still hashes when the email is unknown, so timing does not leak', async () => {
      const compare = jest.spyOn(bcrypt, 'compare');
      userService.findbyEmail.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(compare).toHaveBeenCalledTimes(1);
      expect(compare.mock.calls[0][1]).toMatch(/^\$2[aby]\$12\$/);
    });
  });
});
