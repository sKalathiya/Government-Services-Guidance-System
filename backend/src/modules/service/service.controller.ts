import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';

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
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.serviceService.findById(id);
  }
}
