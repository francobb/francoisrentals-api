import StripeService from '../../../src/services/stripe.service';
import stripe from '../../../src/services/clients/stripe.client';
import { ROOT_URI } from '../../../src/config';
import { Tenant } from '../../../src/interfaces/tenants.interface';
import { MONTHS } from '../../../src/utils/constants';
import { Document } from 'mongoose';

describe('StripeService', function () {
  let tenantData: Tenant & Partial<Document>;
  let stripeService;
  let createMock;
  let mTenantRepository;

  beforeAll(() => {
    tenantData = {
      id: '1232',
      _id: '1232',
      rentalAmount: 0,
      rentalBalance: 2000,
      email: 'j@j.com',
      lease_to: new Date(),
      move_in: new Date(),
      name: 'fakeTenant',
      phone: ['12121212'],
      property: '212 Welles St',
      unit: 'fakeunit',
      customerId: 'fakeCustomerId',
    };
    stripeService = new StripeService();
    mTenantRepository = stripeService.tenants;
  });

  it('should create a payment intent and return the client secret', async () => {
    createMock = jest.fn().mockResolvedValue({});
    mTenantRepository.findOne = jest.fn().mockResolvedValueOnce(tenantData);
    (stripe.paymentIntents.create as jest.Mock) = createMock;
    const result = await stripeService.createPaymentIntent(tenantData.email);
    expect(createMock).toHaveBeenCalledWith({
      customer: tenantData.customerId,
      amount: 200000,
      currency: 'usd',
      setup_future_usage: 'off_session',
      receipt_email: tenantData.email,
      description: `Rent Payment for ${MONTHS[new Date().getMonth()]}`,
      metadata: { name: tenantData.name, email: tenantData.email, id: tenantData._id },

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
    });
    expect(result).toEqual({});
  });

  it('should create a payment session and return the client secret', async () => {
    createMock = jest.fn().mockResolvedValue({});
    mTenantRepository.findOne = jest.fn().mockResolvedValueOnce(tenantData);
    (stripe.checkout.sessions.create as jest.Mock) = createMock;
    const result = await stripeService.createSession(tenantData.email);
    expect(createMock).toHaveBeenCalledWith({
      mode: 'payment',
      customer: tenantData.customerId,
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
    expect(result).toEqual({});
  });
});
