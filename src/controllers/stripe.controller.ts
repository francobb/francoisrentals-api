import { NextFunction, Request, Response } from 'express';
import { ROOT_URI } from '@config';
import stripe from '@/config/stripe.config';
import { logger } from '@utils/logger';

class StripeController {
  public receiveRentPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        // customer: '{{CUSTOMER_ID}}',
        payment_method_types: ['card', 'us_bank_account'],
        payment_method_options: {
          us_bank_account: {
            financial_connections: {
              permissions: ['payment_method'],
            },
          },
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: 200000,
              product_data: {
                name: 'Rent Payment',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${ROOT_URI}?success`,
        cancel_url: `${ROOT_URI}?cancel`,
      });
      res.status(200).json({ data: session, message: session.url });
    } catch (err) {
      next(err);
    }
  };

  public receivePaymentRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 200000,
        currency: 'usd',
        setup_future_usage: 'off_session',
        // automatic_payment_methods: {
        //   enabled: true,
        // },
        payment_method_types: ['card', 'us_bank_account'],
        payment_method_options: {
          us_bank_account: {
            financial_connections: {
              permissions: ['payment_method'],
            },
          },
        },
        metadata: { name: 'William' },
      });
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
