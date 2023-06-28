import { MaintenanceRequest } from '@interfaces/request.interface';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import { HttpException } from '@exceptions/HttpException';
import MaintenanceService from '@services/maintenance.service';

describe('Maintenance Service', () => {
  let mockRequestRepository;
  let requestData: MaintenanceRequest;
  let createRequest: MaintenanceRequestDto;
  let maintenanceService: MaintenanceService;

  beforeAll(() => {
    maintenanceService = new MaintenanceService();
    mockRequestRepository = maintenanceService.maintenanceRequests;
    requestData = {
      _id: '123',
      unit: '1',
      room: 'Kitchen',
      location: '212 welles st',
      details: 'the counter is broken',
    };
    createRequest = {
      unit: '1',
      room: 'Kitchen',
      location: '212 welles st',
      details: 'the counter is broken',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('createRequest', () => {
    it('should create a new req', async () => {
      jest.spyOn(mockRequestRepository, 'create').mockResolvedValueOnce(requestData);

      const result = await maintenanceService.createRequest(createRequest);
      expect(result).toEqual(requestData);
    });

    it('should throw an error if requestData is empty', async () => {
      await expect(maintenanceService.createRequest({} as MaintenanceRequest)).rejects.toThrowError(
        new HttpException(400, 'Invalid Maintenance Request data'),
      );
    });
  });

  describe('findRequestById', function () {
    it('should return request by id', async () => {
      mockRequestRepository.findOne = jest.fn().mockResolvedValue(requestData);
      const result = await maintenanceService.findRequestById('fakeId');
      expect(result).toEqual(requestData);
    });

    it('should not return a request by ID if id does not exist', async () => {
      await expect(maintenanceService.findRequestById('')).rejects.toThrow(HttpException);
    });
  });
});
