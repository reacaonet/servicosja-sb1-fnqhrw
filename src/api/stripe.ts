import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const createSubscription = async (priceId: string, userId: string, planId: string) => {
  try {
    // Criar ou recuperar o cliente
    const customer = await stripe.customers.create({
      metadata: {
        userId,
        planId
      }
    });

    // Criar a assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        planId
      }
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};