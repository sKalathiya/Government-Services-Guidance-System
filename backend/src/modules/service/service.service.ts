import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Service from './entities/service.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { ServiceDetailResponseDto } from './dto/service-detail-response.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  /**
   * List services
   * @param query - Query string
   * @param jurisdiction - Jurisdiction code
   * @throws BadRequestException if jurisdiction is invalid
   * @returns List of services
   */
  async list(query: string, jurisdiction: string) {
    query = query.trim();
    jurisdiction = jurisdiction.trim().toUpperCase();
    let where: FindOptionsWhere<Service> = { isActive: true };
    if (jurisdiction) {
      const isValidJurisdiction =
        await this.jurisdictionService.findByCode(jurisdiction);
      if (!isValidJurisdiction) {
        throw new BadRequestException('Invalid jurisdiction');
      }
      where.jurisdiction = { code: jurisdiction };
    }
    if (query) {
      const escapedQuery = query.replace(/[\\%_]/g, '\\$&');
      where.name = ILike(`%${escapedQuery}%`);
    }
    const services = await this.serviceRepository.find({
      where,
      select: {
        id: true,
        name: true,
        jurisdiction: { code: true, name: true },
      },
      take: 20,
      order: { name: 'ASC' },
      relations: { jurisdiction: true },
    });

    return services;
  }

  async findById(id: string): Promise<ServiceDetailResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        eligibility: true,
        sourceUrl: true,
        officialUrl: true,
        feesType: true,
        feesText: true,
        processingTime: true,
        jurisdiction: { code: true, name: true },
        requiredDocuments: { document: { description: true, example: true } },
        steps: { step_text: true, step_order: true },
      },
      relations: {
        jurisdiction: true,
        requiredDocuments: { document: true },
        steps: true,
      },
      order: { steps: { step_order: 'ASC' } },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    const response = new ServiceDetailResponseDto();
    response.id = service.id;
    response.name = service.name;
    response.description = service.description;
    response.eligibility = service.eligibility;
    response.sourceUrl = service.sourceUrl;
    response.officialUrl = service.officialUrl;
    response.feesType = service.feesType;
    response.feesText = service.feesText;
    response.processingTime = service.processingTime;
    response.jurisdiction = {
      code: service.jurisdiction.code,
      name: service.jurisdiction.name,
    };
    response.requiredDocuments = service.requiredDocuments.map((row) => ({
      description: row.document.description,
      example: row.document.example,
    }));
    response.steps = service.steps.map((step) => ({
      text: step.step_text,
      order: step.step_order,
    }));
    return response;
  }
}
