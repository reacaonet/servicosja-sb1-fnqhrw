import express from 'express';
import Stripe from 'stripe';
import { adminDb } from '../firebase-admin';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  const { priceId, userId, planId, successUrl, cancelUrl } = req.body;

  try {
    const customer = await stripe.customers.create({
      metadata: {
        userId,
        planId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planId } = session.metadata;

        await adminDb.collection('professionals').doc(userId).update({
          subscriptionStatus: {
            active: true,
            planId,
            startDate: new Date().toISOString(),
            customerId: session.customer,
            subscriptionId: session.subscription,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = customer.metadata.userId;

        await adminDb.collection('professionals').doc(userId).update({
          subscriptionStatus: {
            active: false,
            endDate: new Date().toISOString(),
          },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;