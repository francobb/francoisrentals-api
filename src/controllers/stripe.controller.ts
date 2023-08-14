import { NextFunction, Request, Response } from 'express';
import stripe from '@services/clients/stripe.client';
import { logger } from '@utils/logger';
import StripeService from '@services/stripe.service';

class StripeController {
  public stripeService: StripeService = new StripeService();

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
    // Get the signature from the headers
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      // Check if the event is sent from Stripe or a third party
      // And parse the event
      event = await stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

      // Event when a payment is initiated
      if (event.type === 'payment_intent.created') {
        logger.info(`${event.data.object.metadata.name} initated payment!`);
      }
      // Event when a payment is succeeded
      if (event.type === 'payment_intent.succeeded') {
        logger.info(`${event.data.object.metadata.name} succeeded payment!`);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      next(err);
    }
  };
}

export default StripeController;
