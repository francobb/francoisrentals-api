import maintenanceRequestModel from '@models/requests.model';
import { MaintenanceRequest } from '@interfaces/request.interface';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { MaintenanceRequestDto } from '@dtos/request.dto';

class MaintenanceService {
  public maintenanceRequests = maintenanceRequestModel;

  public async createRequest(requestData: MaintenanceRequestDto): Promise<MaintenanceRequest> {
    if (isEmpty(requestData)) throw new HttpException(400, 'Invalid Maintenance Request data');

    return await this.maintenanceRequests.create({ ...requestData });
  }

  public async findRequestById(id: string): Promise<MaintenanceRequest> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid ID');

    return this.maintenanceRequests.findOne({ _id: id });
  }
}

export default MaintenanceService;
