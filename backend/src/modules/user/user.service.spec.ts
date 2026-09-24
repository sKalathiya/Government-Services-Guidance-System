import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';

const callerId = '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60';
const otherId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function user(overrides: Partial<User> = {}) {
  return Object.assign(new User(), {
    id: callerId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: '$2b$12$existinghash',
    role: UserRole.USER,
    ...overrides,
  });
}

describe('UserService', () => {
  let service: UserService;
  let repository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn((value) => value),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUser', () => {
    it('renames the caller and leaves the password hash alone', async () => {
      repository.findOne.mockResolvedValue(user());

      const updated = await service.updateUser({ name: 'Jane Doe' }, callerId);

      expect(updated.name).toBe('Jane Doe');
      expect(updated.passwordHash).toBe('$2b$12$existinghash');
      expect(updated.role).toBe(UserRole.USER);
    });

    it('treats the caller keeping their own email as no conflict', async () => {
      repository.findOne.mockResolvedValue(user());

      await expect(
        service.updateUser({ email: 'john.doe@example.com' }, callerId),
      ).resolves.toMatchObject({ email: 'john.doe@example.com' });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rejects an email another account already has', async () => {
      repository.findOne
        .mockResolvedValueOnce(user())
        .mockResolvedValueOnce(user({ id: otherId, email: 'taken@example.com' }));

      await expect(
        service.updateUser({ email: 'taken@example.com' }, callerId),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an empty update', async () => {
      repository.findOne.mockResolvedValue(user());

      await expect(service.updateUser({}, callerId)).rejects.toThrow(
        'At least one field is required',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('deletes only the id it was given', async () => {
      repository.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(id === callerId ? user() : user({ id: otherId })),
      );

      await service.deleteUser(callerId);

      expect(repository.delete).toHaveBeenCalledWith({ id: callerId });
      expect(repository.delete).not.toHaveBeenCalledWith({ id: otherId });
    });

    it('does not delete a missing user', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(callerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
