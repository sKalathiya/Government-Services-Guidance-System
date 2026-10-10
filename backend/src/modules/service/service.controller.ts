import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceDetailResponseDto } from './dto/service-detail-response.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'List services' })
  @ApiQuery({ name: 'q', type: String, required: false })
  @ApiQuery({ name: 'jurisdiction', type: String, required: false })
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({ description: 'Invalid jurisdiction' })
  async list(
    @Query('q') q: string = '',
    @Query('jurisdiction') jurisdiction: string = '',
  ) {
    return await this.serviceService.list(q, jurisdiction);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find service by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: ServiceDetailResponseDto })
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceDetailResponseDto> {
    return await this.serviceService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiBody({ type: CreateServiceDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Service created successfully' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return await this.serviceService.create(createServiceDto);
  }
}
