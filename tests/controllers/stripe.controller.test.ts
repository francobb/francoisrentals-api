import StripeController from '../../src/controllers/stripe.controller';
import stripe from '../../src/services/clients/stripe.client';

describe('Stripe Controller Unit Tests', function () {
  let mNext;
  let mReq;
  let mRes;
  let stripeController;
  let createMock;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = {};
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    stripeController = new StripeController();
    createMock = jest.fn();
  });

  describe('receiveRentPayment', () => {
    it('should create a session and return the session URL', async () => {
      createMock = jest.fn().mockResolvedValueOnce({ url: 'fake-url' });
      (stripe.checkout.sessions.create as jest.Mock) = createMock;
      await stripeController.receiveRentPayment(mReq, mRes, mNext);
      expect(mRes.status).toHaveBeenCalledWith(200);
      expect(mRes.json).toHaveBeenCalledWith({ data: { url: 'fake-url' }, message: 'fake-url' });
    });

    it('should call the next function with an error if an error occurs', async () => {
      const error = new Error('Some error');
      createMock = jest.fn().mockRejectedValue(error);
      (stripe.checkout.sessions.create as jest.Mock) = createMock;

      await stripeController.receiveRentPayment(mReq, mRes, mNext);
      expect(mNext).toHaveBeenCalledWith(error);
    });
  });

  describe('receivePaymentRequest', () => {
    it('should create a payment intent and return the client secret', async () => {
      createMock = jest.fn().mockResolvedValue({ client_secret: 'fake-client-secret' });
      (stripe.paymentIntents.create as jest.Mock) = createMock;
      await stripeController.receivePaymentRequest(mReq, mRes, mNext);
      expect(mRes.json).toHaveBeenCalledWith({ message: 'Payment initiated', clientSecret: 'fake-client-secret' });
    });

    it('should call the next function with an error if an error occurs', async () => {
      const error = new Error('Some error');
      createMock = jest.fn().mockRejectedValue(error);
      (stripe.paymentIntents.create as jest.Mock) = createMock;

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
