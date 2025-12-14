import { Property } from '@models/property.pg_model';
import { Repository } from 'typeorm';
import { AppDataSource } from '@databases';

class PropertyService {
  public pg_properties: Repository<Property> = AppDataSource.getRepository(Property);

  public async findAllProperties(): Promise<Property[]> {
    const queryBuilder = this.pg_properties
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.units', 'unit')
      .leftJoinAndSelect('unit.currentOccupancy', 'occupancy')
      .orderBy('property.name', 'ASC');

    return await queryBuilder.getMany();
  }

  public async getAverageMonthlyExpenses(): Promise<{ totalProperties: number; totalExpenses: number; averageExpense: number }> {
    const properties = await this.pg_properties.find();
    const totalProperties = properties.length;

    if (totalProperties === 0) {
      return { totalProperties: 0, totalExpenses: 0, averageExpense: 0 };
    }

    const totalExpenses = properties.reduce((acc, property) => {
      const managementFee = Number(property.managementFee) || 0;
      const mortgage = Number(property.mortgage) || 0;
      const sewer = Number(property.sewer) || 0;
      const water = Number(property.water) || 0;
      const trash = Number(property.trash) || 0;
      const gas = Number(property.gas) || 0;
      return acc + managementFee + mortgage + sewer + water + trash + gas;
    }, 0);

    const averageExpense = totalExpenses / totalProperties;

    return { totalProperties, totalExpenses, averageExpense };
  }
}

export default PropertyService;
