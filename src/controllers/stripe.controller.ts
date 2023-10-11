import { NextFunction, Request, Response } from 'express';
import stripe from '@services/clients/stripe.client';
import { logger } from '@utils/logger';
import StripeService from '@services/stripe.service';
import { STRIPE_WEBHOOK_SECRET } from '@config';
import TenantService from '@services/tenants.service';
import { Tenant } from '@interfaces/tenants.interface';

class StripeController {
  public stripeService: StripeService = new StripeService();
  public tenantService = new TenantService();

  public receiveRentPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.stripeService.createSession(req.body.email);

      res.status(200).json({ data: session, message: session.url });
    } catch (err) {
      next(err);
    }
  };

  public receivePaymentRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(req.body.email);

      res.status(200).json({ message: 'Payment initiated', clientSecret: paymentIntent.client_secret });
    } catch (e) {
      next(e);
    }
  };

  public processStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).rawBody;

    // Get the signature from the headers
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);

      // Event when a payment is initiated
      if (event.type === 'payment_intent.created') {
        logger.info(`${event.data.object.metadata.name} initiated payment!`);
      }

      // Event when a payment is succeeded
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntentSucceeded = event.data.object;
        const tenant = await this.tenantService.findTenantById(paymentIntentSucceeded.metadata.id);
        const balance = Number(tenant.rentalBalance) - Number(paymentIntentSucceeded.amount_received) / 100;
        await this.tenantService.updateTenant(paymentIntentSucceeded.metadata.id, { rentalBalance: balance } as Tenant);

        logger.info(`${paymentIntentSucceeded.metadata.name} succeeded payment!`);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      next(err);
    }
  };

  public getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await this.stripeService.getCustomerTransactions(req.query.customerId);
      const successfulTransactions = transactions.filter(transaction => transaction.status === 'succeeded');
      res.status(200).json({ message: 'Retrieved Transactions', transactions: successfulTransactions });
    } catch (e) {
      next(e);
    }
  };
}

export default StripeController;
