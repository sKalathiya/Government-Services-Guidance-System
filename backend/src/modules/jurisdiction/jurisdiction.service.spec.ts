import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JurisdictionService } from './jurisdiction.service';
import Jurisdiction from './entities/jurisdiction.entity';

describe('JurisdictionService', () => {
  let service: JurisdictionService;
  let repository: { findOne: jest.Mock };

  beforeEach(async () => {
    repository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JurisdictionService,
        {
          provide: getRepositoryToken(Jurisdiction),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<JurisdictionService>(JurisdictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds a jurisdiction by its stable code', async () => {
    const jurisdiction = { code: 'GUJARAT', name: 'Gujarat' };
    repository.findOne.mockResolvedValue(jurisdiction);

    await expect(service.findByCode('GUJARAT')).resolves.toBe(jurisdiction);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { code: 'GUJARAT' },
    });
  });
});
