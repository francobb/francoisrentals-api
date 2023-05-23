import { NextFunction, Response } from 'express';
import TenantsController from '@controllers/tenants.controller';
import TenantService from '@services/tenants.service';
import { CreateTenantDto } from '@dtos/tenants.dto';
import { HttpException } from '@exceptions/HttpException';
describe('Tenant Controller', function () {
  let mRes: Partial<Response>;
  let mReq;
  let mNext: NextFunction;
  let tenantsController: TenantsController;
  let mTenantService: TenantService;
  let tenantData: CreateTenantDto;

  beforeAll(() => {
    tenantData = {
      email: '',
      lease_to: new Date(),
      move_in: new Date(),
      name: 'fakeTenant',
      phone: ['12121212'],
      property: 'fakeProperty',
      unit: 'fakeunit',
    };
    mNext = jest.fn();
    mReq = { body: tenantData };
    mRes = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    tenantsController = new TenantsController();
    mTenantService = tenantsController.tenantService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenants()', function () {
    it('should get tenants', async () => {
      mTenantService.findAllTenants = jest.fn().mockResolvedValueOnce([]);
      await tenantsController.getTenants(mReq, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'getTenants',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not get tenants', async () => {
      const error = new HttpException(401, 'error, HORr');
      mTenantService.findAllTenants = jest.fn().mockRejectedValueOnce(error);
      await tenantsController.getTenants(mReq, mRes as Response, mNext);

      expect(mNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createTenant()', function () {
    it('should create tenant', async () => {
      mTenantService.createTenant = jest.fn().mockResolvedValueOnce([]);
      await tenantsController.createTenant(mReq, mRes as Response, mNext);

      expect(mRes.status).toHaveBeenCalledWith(201);
      expect(mRes.json).toHaveBeenCalledWith({
        data: expect.any(Object),
        message: 'Tenant created successfully',
      });
      expect(mNext).not.toHaveBeenCalled();
    });

    it('should not create tenant', async () => {
      const error = new HttpException(401, 'error');
      mTenantService.createTenant = jest.fn().mockRejectedValueOnce(error);
      await tenantsController.createTenant(mReq, mRes as Response, mNext);

      expect(mNext).toHaveBeenCalledWith(error);
    });
  });
});
