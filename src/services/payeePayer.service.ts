import PayeePayerModel from '@models/payeePayer.model';

class PayeePayerService {
  public async createPayeePayer(name: string) {
    const payeePayer = new PayeePayerModel({ name });
    await payeePayer.save();
    return payeePayer;
  }
}

export default PayeePayerService;
