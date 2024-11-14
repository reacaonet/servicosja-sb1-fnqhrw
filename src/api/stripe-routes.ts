import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId, planId, planName, successUrl, cancelUrl } = req.body;

    // Create or get customer
    let customer;
    const customers = await stripe.customers.list({ email: req.body.email, limit: 1 });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: req.body.email,
        metadata: { userId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: req.body.priceId,
        quantity: 1,
      }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        planName
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.get('/verify-payment', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    const session = await stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ['subscription']
    });

    res.json({ subscription: session.subscription });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;