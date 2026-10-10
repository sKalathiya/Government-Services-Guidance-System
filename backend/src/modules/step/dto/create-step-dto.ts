import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStepDto {
  @ApiProperty({ description: 'The order of the step' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  step_order: number;

  @ApiProperty({ description: 'The text of the step' })
  @IsString()
  @IsNotEmpty()
  step_text: string;
}
