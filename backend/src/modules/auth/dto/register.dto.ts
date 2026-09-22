import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password@123',
  })
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @MaxLength(72)
  password: string;
}
