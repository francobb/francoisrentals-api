import Stripe from 'stripe';
import { STRIPE_ACCESS_KEY } from '@/config/index';

const stripe = new Stripe(STRIPE_ACCESS_KEY, {
  apiVersion: '2022-11-15',
  typescript: true,
});

export default stripe;
