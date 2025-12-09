import Stripe from 'stripe';
import { STRIPE_ACCESS_KEY } from '@config';

const stripe = new Stripe(STRIPE_ACCESS_KEY, {
  // CORRECTED: Updated to the version required by the installed library.
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

export default stripe;
