import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

const validPayload = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'Password@123',
};

async function validateRegister(plain: Record<string, unknown>) {
  const dto = plainToInstance(RegisterDto, plain);
  return {
    dto,
    errors: await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  };
}

describe('RegisterDTO', () => {
  it('accepts a valid payload', async () => {
    const { errors } = await validateRegister(validPayload);
    expect(errors).toHaveLength(0);
  });

  it('rejects a weak password', async () => {
    const { errors } = await validateRegister({
      ...validPayload,
      password: 'password',
    });
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects extra fields such as role', async () => {
    const { errors } = await validateRegister({
      ...validPayload,
      role: 'ADMIN',
    });
    expect(errors.some((error) => error.property === 'role')).toBe(true);
  });

  it('trims and lowercases email', async () => {
    const { dto, errors } = await validateRegister({
      ...validPayload,
      email: '  John.Doe@Example.COM  ',
    });
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('john.doe@example.com');
  });

  it('rejects a name that is only whitespace', async () => {
    const { errors } = await validateRegister({
      ...validPayload,
      name: '   ',
    });
    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
