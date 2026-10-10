import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
  ArrayUnique,
} from 'class-validator';
import { FeesType } from '../entities/service.entity';
import { IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateStepDto } from '../../step/dto/create-step-dto';

export class CreateServiceDto {
  @ApiProperty({ description: 'The name of the service' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the service' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The eligibility of the service' })
  @IsString()
  @IsNotEmpty()
  eligibility: string;

  @ApiProperty({ description: 'The source URL of the service' })
  @IsUrl()
  @IsNotEmpty()
  sourceUrl: string;

  @ApiProperty({ description: 'The official URL of the service' })
  @IsUrl()
  @IsNotEmpty()
  officialUrl: string;

  @ApiProperty({ description: 'The fees type of the service', enum: FeesType })
  @IsEnum(FeesType)
  @Transform(({ value }) => value ?? FeesType.UNKNOWN)
  feesType: FeesType;

  @ApiProperty({ description: 'The fees text of the service' })
  @IsString()
  feesText: string;

  @ApiProperty({ description: 'The processing time of the service' })
  @IsString()
  processingTime: string;

  @ApiProperty({ description: 'The is active of the service' })
  @IsBoolean()
  @Transform(({ value }) => value ?? true)
  isActive: boolean;

  @ApiProperty({ description: 'The jurisdiction of the service' })
  @IsString()
  jurisdiction: string;

  @ApiProperty({ description: 'The required documents of the service' })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayUnique()
  requiredDocuments: string[];

  @ApiProperty({ description: 'The steps of the service' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps: CreateStepDto[];
}
