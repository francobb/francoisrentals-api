import { NextFunction, Request, Response } from 'express';

class StripeController {
  public receiveRentPayment = async (req: Request, res: Response, next: NextFunction) => {
    console.log('made it to receive rent payment');
    // try {
    // } catch (err) {
    //   next(err);
    // }
  };
}

export default StripeController;
