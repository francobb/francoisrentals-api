import { MaintenanceRequest } from '@interfaces/request.interface';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';

describe('Maintenance Service', () => {
  let mockRequestRepository;
  let requestData: MaintenanceRequest;
  let createRequest: MaintenanceRequestDto;
  let maintenanceService: MaintenanceService;

  it('createRequest', async () => {
    it('should create a new user', async () => {
      const result = await maintenanceService.createRequest(createRequest);

      // expect(result).toEqual(userData);
    });
    it('should throw an error if userData is empty', async () => {
      await expect(maintenanceService.createUser({} as MaintenanceRequestDto)).rejects.toThrowError(new HttpException(400, "You're not userData"));
    });
  });
});
