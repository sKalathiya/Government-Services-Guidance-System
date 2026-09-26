import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { ServiceService } from './service.service';
import Service, { FeesType } from './entities/service.entity';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';

const serviceId = '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60';

const listQuery = {
  select: {
    id: true,
    name: true,
    jurisdiction: { code: true, name: true },
  },
  take: 20,
  order: { name: 'ASC' },
  relations: { jurisdiction: true },
};

describe('ServiceService', () => {
  let service: ServiceService;
  let repository: { find: jest.Mock; findOne: jest.Mock };
  let jurisdictions: { findByCode: jest.Mock };

  beforeEach(async () => {
    repository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({
        id: serviceId,
        name: 'Senior Pension',
        description: 'Monthly financial assistance.',
        eligibility: 'Residents aged 60 and above.',
        sourceUrl: 'https://example.gov/source',
        officialUrl: 'https://example.gov/apply',
        feesType: FeesType.FREE,
        feesText: null,
        processingTime: '30 days',
        jurisdiction: { code: 'GUJARAT', name: 'Gujarat' },
        requiredDocuments: [
          {
            document: {
              id: 'document-1',
              description: 'Identity proof',
              example: null,
            },
          },
        ],
        steps: [
          {
            id: 'step-1',
            step_text: 'Complete the application.',
            step_order: 1,
          },
        ],
      }),
    };
    jurisdictions = {
      findByCode: jest.fn().mockResolvedValue({ code: 'GUJARAT' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: getRepositoryToken(Service), useValue: repository },
        { provide: JurisdictionService, useValue: jurisdictions },
      ],
    }).compile();

    service = module.get(ServiceService);
  });

  function querySent() {
    return repository.find.mock.calls[0][0];
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists active services by name when there is no search', async () => {
    await service.list('   ', '');

    expect(jurisdictions.findByCode).not.toHaveBeenCalled();
    expect(querySent()).toEqual({
      ...listQuery,
      where: { isActive: true },
    });
  });

  it('matches a partial name without caring about case', async () => {
    await service.list('  Ration  ', '   ');

    expect(querySent().where).toEqual({
      name: ILike('%Ration%'),
      isActive: true,
    });
  });

  it('treats % _ and backslash as characters, not pattern syntax', async () => {
    await service.list('100%_\\', '');

    expect(querySent().where.name).toEqual(ILike('%100\\%\\_\\\\%'));
  });

  it('narrows to one jurisdiction and accepts either case', async () => {
    await service.list('', '  gujarat  ');

    expect(jurisdictions.findByCode).toHaveBeenCalledWith('GUJARAT');
    expect(querySent().where).toEqual({
      isActive: true,
      jurisdiction: { code: 'GUJARAT' },
    });
  });

  it('applies the name search and the jurisdiction together', async () => {
    await service.list('ration', 'CENTRAL');

    expect(querySent().where).toEqual({
      isActive: true,
      name: ILike('%ration%'),
      jurisdiction: { code: 'CENTRAL' },
    });
  });

  it('rejects an unknown jurisdiction before querying services', async () => {
    jurisdictions.findByCode.mockResolvedValue(null);

    await expect(service.list('ration', 'MARS')).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.find).not.toHaveBeenCalled();
  });

  describe('findById', () => {
    it('loads one active service with its documents and ordered steps', async () => {
      await expect(service.findById(serviceId)).resolves.toEqual({
        id: serviceId,
        name: 'Senior Pension',
        description: 'Monthly financial assistance.',
        eligibility: 'Residents aged 60 and above.',
        sourceUrl: 'https://example.gov/source',
        officialUrl: 'https://example.gov/apply',
        feesType: FeesType.FREE,
        feesText: null,
        processingTime: '30 days',
        jurisdiction: { code: 'GUJARAT', name: 'Gujarat' },
        requiredDocuments: [
          {
            id: 'document-1',
            description: 'Identity proof',
            example: null,
          },
        ],
        steps: [
          {
            id: 'step-1',
            text: 'Complete the application.',
            order: 1,
          },
        ],
      });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: serviceId, isActive: true },
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
          requiredDocuments: {
            id: true,
            document: { id: true, description: true, example: true },
          },
          steps: { id: true, step_text: true, step_order: true },
        },
        relations: {
          jurisdiction: true,
          requiredDocuments: { document: true },
          steps: true,
        },
        order: { steps: { step_order: 'ASC' } },
      });
    });

    it('treats a missing or inactive service as not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(serviceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
