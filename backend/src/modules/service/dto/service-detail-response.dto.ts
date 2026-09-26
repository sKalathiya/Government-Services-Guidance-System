import { ApiProperty } from '@nestjs/swagger';
import { FeesType } from '../entities/service.entity';

export class ServiceResultsStepDto {
  @ApiProperty({
    description: ' The Id of the step',
    type: String,
  })
  id: string;

  @ApiProperty({ description: 'The text of the step', type: String })
  text: string;

  @ApiProperty({ description: 'The order of the step', type: Number })
  order: number;
}

export class ServiceResultsRequiredDocumentDto {
  @ApiProperty({
    description: ' The Id of the required document',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The description of the required document',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'The example of the required document',
    type: String,
    nullable: true,
  })
  example: string | null;
}

export class ServiceResultsJurisdictionDto {
  @ApiProperty({ description: 'The code of the jurisdiction', type: String })
  code: string;

  @ApiProperty({ description: 'The name of the jurisdiction', type: String })
  name: string;
}

export class ServiceDetailResponseDto {
  @ApiProperty({ description: 'The ID of the service', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the service', type: String })
  name: string;

  @ApiProperty({ description: 'The description of the service', type: String })
  description: string;

  @ApiProperty({ description: 'The eligibility of the service', type: String })
  eligibility: string;

  @ApiProperty({ description: 'The source URL of the service', type: String })
  sourceUrl: string;

  @ApiProperty({ description: 'The official URL of the service', type: String })
  officialUrl: string;

  @ApiProperty({
    description: 'The fees type of the service',
    enumName: 'FeesType',
    enum: FeesType,
  })
  feesType: FeesType;

  @ApiProperty({
    description: 'The fees text of the service',
    type: String,
    nullable: true,
  })
  feesText: string | null;

  @ApiProperty({
    description: 'The processing time of the service',
    type: String,
    nullable: true,
  })
  processingTime: string | null;

  @ApiProperty({
    description: 'The required documents of the service',
    type: [ServiceResultsRequiredDocumentDto],
  })
  requiredDocuments: ServiceResultsRequiredDocumentDto[];

  @ApiProperty({
    description: 'The jurisdiction of the service',
    type: ServiceResultsJurisdictionDto,
  })
  jurisdiction: ServiceResultsJurisdictionDto;

  @ApiProperty({
    description: 'The steps of the service',
    type: [ServiceResultsStepDto],
  })
  steps: ServiceResultsStepDto[];
}
