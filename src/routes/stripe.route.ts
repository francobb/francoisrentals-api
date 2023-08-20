import StripeController from '@/controllers/stripe.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import authMiddleware, { checkRole } from '@middlewares/auth.middleware';

class StripeRoute implements Routes {
  public path = '/payment';
  public router = Router();
  public stripeController = new StripeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.stripeController.receiveRentPayment);
    this.router.post(`${this.path}/request`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.stripeController.receivePaymentRequest);
    this.router.post(`/stripe`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.stripeController.processStripeWebhook);
  }
}

export default StripeRoute;
