import { NextFunction, Response } from 'express';
import { IRequest } from '@utils/interfaces';
import { logger } from '@utils/logger';
import PropertyService from '@services/properties.service';
import { Property } from '@models/property.pg_model';

const transformProperties = (properties: Property[]) => {
  return properties.map(p => ({
    id: p.externalId,
    type: 'properties',
    attributes: {
      meta: null,
      hidden: false,
      minimum_cash_reserve: 0,
      raw_display_name: p.name,
    },
    relationships: {
      address: {
        id: null, // Not available in our model
        type: 'addresses',
        attributes: {
          full: p.address,
        },
      },
      units: p.units.map(u => ({
        id: u.externalId,
        type: 'units',
        attributes: {
          meta: null,
          name: u.name,
          occupied: u.occupied,
        },
        relationships: {
          current_occupancy: u.currentOccupancy
            ? {
                id: u.currentOccupancy.externalId,
                type: 'occupancies',
                attributes: {
                  move_in: u.currentOccupancy.moveIn,
                  total_rent_and_subsidy: u.currentOccupancy.rent,
                },
                relationships: {
                  lease: {
                    id: null, // Not available in our model
                    type: 'leases',
                    attributes: {
                      end_on: u.currentOccupancy.leaseEnd,
                    },
                  },
                },
              }
            : null,
        },
      })),
      monthly_costs: {
        management_fee: p.managementFee,
        mortgage: p.mortgage,
        sewer: p.sewer,
        water: p.water,
        trash: p.trash,
        gas: p.gas,
      },
    },
  }));
};

class PropertiesController {
  public propertyService = new PropertyService();

  public getProperties = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const properties = await this.propertyService.findAllProperties();
      const transformedProperties = transformProperties(properties);
      res.status(200).json({ data: transformedProperties, message: 'findAll' });
    } catch (e) {
      next(e);
    }
  };

  public getAverageExpenses = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const averageExpenses = await this.propertyService.getAverageMonthlyExpenses();
      res.status(200).json({ data: averageExpenses, message: 'findAverageExpenses' });
    } catch (e) {
      next(e);
    }
  };
}

export default PropertiesController;
