import MaintenanceRequestModel from '@models/requests.model';
import { HttpException } from '@exceptions/HttpException';
import { MaintenanceRequest } from '@interfaces/request.interface';
import { MaintenanceRequestDto } from '@dtos/request.dto';
import { isEmpty } from '@utils/util';

class MaintenanceService {
  public maintenanceRequests = MaintenanceRequestModel;

  public async createRequest(requestData: MaintenanceRequestDto): Promise<MaintenanceRequest> {
    if (isEmpty(requestData)) throw new HttpException(400, 'Invalid Maintenance Request data');

    return await this.maintenanceRequests.create({ ...requestData, date: Date.now() });
  }

  public async findRequestById(id: string): Promise<MaintenanceRequest> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid ID');

    return this.maintenanceRequests.findOne({ _id: id });
  }
}

export default MaintenanceService;
