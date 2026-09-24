import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class PasswordChangeDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'Password@123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
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
  newPassword: string;
}
