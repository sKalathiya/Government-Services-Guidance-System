import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceDetailResponseDto } from './dto/service-detail-response.dto';

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
}
