import stripe from '@clients/stripe.client';
import { ROOT_URI } from '@config';
import tenantsModel from '@models/tenants.model';

class StripeService {
  public tenants = tenantsModel;

  public createPaymentIntent = async email => {
    const tenant = await this.tenants.findOne({ email });
    return await stripe.paymentIntents.create({
      customer: tenant.customerId,
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
      // metadata: { name: 'William' },
    });
  };

  public createSession = async email => {
    const tenant = await this.tenants.findOne({ email });
    return await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: tenant.customerId,
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
  };
}

export default StripeService;
