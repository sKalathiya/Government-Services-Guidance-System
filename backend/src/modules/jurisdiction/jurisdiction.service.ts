import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Jurisdiction from './entities/jurisdiction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JurisdictionService {
  constructor(
    @InjectRepository(Jurisdiction)
    private readonly jurisdictionRepository: Repository<Jurisdiction>,
  ) {}

  async findByCode(code: string) {
    return await this.jurisdictionRepository.findOne({
      where: { code },
    });
  }
}
