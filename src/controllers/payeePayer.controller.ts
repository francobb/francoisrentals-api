import { NextFunction, Request, Response } from 'express';
import PayeePayerService from '@services/payeePayer.service';

class PayeePayerController {
  private payeePayerService = new PayeePayerService();

  createPayeePayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const payeePayer = await this.payeePayerService.createPayeePayer(name);
      res.status(201).json(payeePayer);
    } catch (error) {
      next(error);
    }
  };
}

export default PayeePayerController;
