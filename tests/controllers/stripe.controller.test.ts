import StripeController from '../../src/controllers/stripe.controller';

describe('Stripe Controller Unit Tests', function () {
  let err;
  let mNext;
  let mReq;
  let mRes;
  let stripeController;

  beforeAll(() => {
    mNext = jest.fn();
    mReq = {};
    mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Partial<Response>;
    stripeController = new StripeController();
  });

  describe('rentPayment()', function () {
    it('should successfully receive a rent payment ', function () {
      stripeController.receiveRentPayment(mReq, mRes, mNext);
    });
  });
});
