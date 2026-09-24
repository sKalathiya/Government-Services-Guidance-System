import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

const serviceId = '6f1b9b7e-0f3a-4f9a-8a1e-2c9d3b4a5e60';

describe('ServiceController', () => {
  let app: INestApplication<App>;
  let service: { list: jest.Mock; findById: jest.Mock };

  beforeEach(async () => {
    service = {
      list: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: serviceId, name: 'Ration Card' }),
    };

    const module = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [{ provide: ServiceService, useValue: service }],
    }).compile();

    app = module.createNestApplication<INestApplication<App>>();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app.get(ServiceController)).toBeDefined();
  });

  it('lists services with no cookie and no search', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/services');

    expect(response.status).toBe(200);
    expect(service.list).toHaveBeenCalledWith('', '');
  });

  it('passes q through to the service', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/services?q=ration',
    );

    expect(response.status).toBe(200);
    expect(service.list).toHaveBeenCalledWith('ration', '');
  });

  it('passes the jurisdiction code through to the service', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/services?q=ration&jurisdiction=gujarat',
    );

    expect(response.status).toBe(200);
    expect(service.list).toHaveBeenCalledWith('ration', 'gujarat');
  });

  it('returns one service with no cookie', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/services/${serviceId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: serviceId, name: 'Ration Card' });
    expect(service.findById).toHaveBeenCalledWith(serviceId);
  });

  it('rejects an id that is not a UUID', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/services/not-a-uuid',
    );

    expect(response.status).toBe(400);
    expect(service.findById).not.toHaveBeenCalled();
  });

  it('returns 404 when the service is missing or inactive', async () => {
    service.findById.mockRejectedValue(new NotFoundException('Service not found'));

    const response = await request(app.getHttpServer()).get(
      `/api/v1/services/${serviceId}`,
    );

    expect(response.status).toBe(404);
  });
});
