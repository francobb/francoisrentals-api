import { NextFunction, Response } from 'express';
import { IRequest } from '@utils/interfaces';
import TenantChargeService from '@services/tenant-charges.service';
import { TenantCharge } from '@models/tenant-charge.pg_model';

const transformTenantCharges = (charges: TenantCharge[]) => {
  return charges.map(charge => ({
    amount: Number(charge.amount),
    balance: Number(charge.balance),
    occurredOn: charge.occurredOn.toISOString().split('T')[0], // Format to YYYY-MM-DD
    propertyId: charge.property.externalId,
    // Find the tenant name by looking through the property's units and their occupancies.
    // This logic assumes a charge is associated with a property that has a currently occupied unit.

    tenantName: charge.property.units?.find(u => u.currentOccupancy?.tenant)?.currentOccupancy.tenant.name,
    // tenantName:
    //   charge.property.units
    //     ?.map(unit => unit.occupancies?.find(occ => occ.tenant)?.tenant.name)
    //     .find(name => name) || null,
  }));
};

class TenantChargesController {
  public tenantChargeService = new TenantChargeService();

  public getTenantCharges = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ message: 'startDate and endDate query parameters are required' });
        return;
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
