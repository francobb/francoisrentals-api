import { NextFunction, Response } from 'express';
import { IRequest } from '@utils/interfaces';
import TenantChargeService from '@services/tenant-charges.service';
import { TenantCharge } from '@models/tenant-charge.pg_model';

const transformTenantCharges = (charges: TenantCharge[]) => {
  return charges.map(charge => ({
    id: charge.externalId,
    amount: Number(charge.amount),
    balance: Number(charge.balance),
    occurredOn: charge.occurredOn.toISOString().split('T')[0], // Format to YYYY-MM-DD
    propertyId: charge.property.externalId,
  }));
};

class TenantChargesController {
  public tenantChargeService = new TenantChargeService();

  public getTenantCharges = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate query parameters are required' });
      }
      const tenantCharges = await this.tenantChargeService.findAll(startDate as string, endDate as string);
      const transformedCharges = transformTenantCharges(tenantCharges);
      res.status(200).json({ data: transformedCharges, message: 'findAll' });
    } catch (e) {
      next(e);
    }
  };
}

export default TenantChargesController;
