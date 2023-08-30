import TenantService from '@services/tenants.service';
import { HttpException } from '@exceptions/HttpException';
import { CreateTenantDto } from '@dtos/tenants.dto';
import stripe from '../../../src/services/clients/stripe.client';

describe('Tenants service', function () {
  let tenantService: TenantService;
  let mTenantRepository;
  let tenantData;
  let tenantId;
  let createMock;

  beforeAll(() => {
    tenantService = new TenantService();
    mTenantRepository = tenantService.tenants;
    tenantData = {
      email: 'j@j.com',
      lease_to: new Date(),
      move_in: new Date(),
      name: 'fakeTenant',
      phone: ['12121212'],
      property: 'fakeProperty',
      unit: 'fakeunit',
    };
    tenantId = '1';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllTenants()', function () {
    it('should return all tenants', async () => {
      jest.spyOn(mTenantRepository, 'find').mockReturnValueOnce([]);

      await tenantService.findAllTenants();
      expect(mTenantRepository.find).toHaveBeenCalled();
    });
  });

  describe('createTenant()', function () {
    it('should create tenant', async () => {
      createMock = jest.fn().mockResolvedValueOnce({ id: 'fake-id' });
      (stripe.customers.create as jest.Mock) = createMock;
      mTenantRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mTenantRepository.create = jest.fn().mockResolvedValueOnce(tenantData);
      const result = await tenantService.createTenant(tenantData);
      expect(result).toEqual(tenantData);
      expect(mTenantRepository.create).toHaveBeenCalled();
    });
    it('should not create existing tenant', async () => {
      createMock = jest.fn().mockResolvedValueOnce({ id: 'fake-id' });
      (stripe.customers.create as jest.Mock) = createMock;
      mTenantRepository.findOne = jest.fn().mockResolvedValueOnce(tenantData);
      await expect(tenantService.createTenant(tenantData)).rejects.toThrow(new HttpException(400, `You're already registered`));
      expect(mTenantRepository.create).not.toHaveBeenCalled();
    });
    it('should not create tenant when data is empty', async () => {
      await expect(tenantService.createTenant(null)).rejects.toThrow(new HttpException(400, "You're not tenantData"));
      expect(mTenantRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTenant()', function () {
    it('should update the tenant', async () => {
      mTenantRepository.findByIdAndUpdate = jest.fn().mockResolvedValueOnce({ ...tenantData, email: 'p@p.com' });

      const result = await tenantService.updateTenant(tenantId, tenantData);
      expect(result).toEqual({ ...tenantData, email: 'p@p.com' });
    });

    it('should not update the tenant if there is not tenant data', async () => {
      await expect(tenantService.updateTenant(tenantId, {} as CreateTenantDto)).rejects.toThrow(new HttpException(400, "You're not tenantData"));
    });

    it('should not update tenants that do not exist', async () => {
      mTenantRepository.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(tenantService.updateTenant(tenantId, tenantData)).rejects.toThrow(new HttpException(400, `Tenant not found`));
    });
  });
});
