import { Request, Response } from 'express';
import StripeController from '../../../src/controllers/stripe.controller';
import stripe from '../../../src/services/clients/stripe.client';

describe('Stripe Controller Unit Tests', function () {
  let createMock;
  let mNext;
  let mReq;
  let mRes;
  let mStripeService;
  let stripeController;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = {
      body: { email: 'foo@bar.com' },
    };
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    stripeController = new StripeController();
    mStripeService = stripeController.stripeService;
    createMock = jest.fn();
  });

  describe('receiveRentPayment', () => {
    it('should call the next function with an error if an error occurs', async () => {
      const error = new Error('Some error');
      mStripeService.createSession = jest.fn().mockRejectedValue(error);

      await stripeController.receiveRentPayment(mReq, mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });

    it('should call the stripe service to get a stripe session', async () => {
      mStripeService.createSession = jest.fn().mockResolvedValueOnce({ url: 'fake-url' });

      await stripeController.receiveRentPayment(mReq, mRes, mNext);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({ data: { url: 'fake-url' }, message: 'fake-url' });
    });
  });

  describe('receivePaymentRequest', () => {
    it('should create a payment intent and return the client secret', async () => {
      mStripeService.createPaymentIntent = jest.fn().mockResolvedValue({ client_secret: 'fake-client-secret' });
      await stripeController.receivePaymentRequest(mReq, mRes, mNext);
      expect(mRes.json).toHaveBeenCalledWith({ message: 'Payment initiated', clientSecret: 'fake-client-secret' });
    });

    it('should call the next function with an error if an error occurs', async () => {
      const error = new Error('Some error');
      mStripeService.createPaymentIntent = jest.fn().mockRejectedValue(error);

      await stripeController.receivePaymentRequest(mReq, mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });

  describe('processStripeWebhook', () => {
    it('should process the Stripe webhook and log payment initiation', async () => {
      mReq = {
        body: {},
        headers: { 'stripe-signature': 'mocked-signature' },
      } as unknown as Request;
      createMock = jest.fn().mockResolvedValue({
        type: 'payment_intent.created',
        data: {
          object: { metadata: { name: 'fake name' } },
        },
      });

      (stripe.webhooks.constructEvent as jest.Mock) = createMock;

      await stripeController.processStripeWebhook(mReq, mRes, mNext);
      expect(mRes.json).toHaveBeenCalledWith({ ok: true });
    });

    it('should process the Stripe webhook and log succeeded payment', async () => {
      mReq = {
        body: {},
        headers: { 'stripe-signature': 'mocked-signature' },
      } as unknown as Request;
      createMock = jest.fn().mockResolvedValue({
        type: 'payment_intent.succeeded',
        data: {
          object: { metadata: { name: 'fake name' } },
        },
      });

      (stripe.webhooks.constructEvent as jest.Mock) = createMock;

      await stripeController.processStripeWebhook(mReq, mRes, mNext);
      expect(mRes.json).toHaveBeenCalledWith({ ok: true });
    });

    it('should call the next function with an error if an error occurs', async () => {
      mReq = {
        body: {},
        headers: { 'stripe-signature': 'mocked-signature' },
      } as unknown as Request;
      const error = new Error('Some error');
      createMock = jest.fn().mockRejectedValue(error);
      (stripe.webhooks.constructEvent as jest.Mock) = createMock;

      await stripeController.processStripeWebhook(mReq, mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });
});
