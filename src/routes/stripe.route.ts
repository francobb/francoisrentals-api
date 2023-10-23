import StripeController from '@/controllers/stripe.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import authMiddleware, { checkClient, checkRole } from '@middlewares/auth.middleware';

class StripeRoute implements Routes {
  public path = '/payment';
  public router = Router();
  public stripeController = new StripeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/transactions`, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.stripeController.getTransactions);
    this.router.post(`${this.path}`, checkClient, authMiddleware, checkRole(['ADMIN', 'TENANT']), this.stripeController.receiveRentPayment);
    this.router.post(
      `${this.path}/request`,
      checkClient,
      authMiddleware,
      checkRole(['ADMIN', 'TENANT']),
      this.stripeController.receivePaymentRequest,
    );
    this.router.post(`${this.path}/webhook`, this.stripeController.processStripeWebhook);
  }
}

export default StripeRoute;
