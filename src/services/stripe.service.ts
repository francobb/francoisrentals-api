import stripe from '@clients/stripe.client';
import { ROOT_URI } from '@config';
import tenantsModel from '@models/tenants.model';
import { MONTHS } from '@utils/constants';

class StripeService {
  public tenants = tenantsModel;

  public createPaymentIntent = async email => {
    const tenant = await this.tenants.findOne({ email });
    return await stripe.paymentIntents.create({
      customer: tenant.customerId,
      amount: tenant.rentalBalance * 100,
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
      description: `Rent Payment for ${MONTHS[new Date().getMonth()]}`,
      receipt_email: tenant.email,
      metadata: { name: tenant.name, email: tenant.email, id: tenant.id },
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

  public getCustomerTransactions = async customerId => {
    try {
      const transactions = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 200,
      });
      return transactions.data;
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      throw error;
    }
  };
}

export default StripeService;
