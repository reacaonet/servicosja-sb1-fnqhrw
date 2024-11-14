import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Webhook Error: No signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object as Stripe.Checkout.Session;
        const { userId, planId, planName, amount } = session.metadata || {};
        const customerEmail = session.customer_details?.email;

        if (userId) {
          // Atualizar status da assinatura
          await updateDoc(doc(db, 'professionals', userId), {
            subscriptionStatus: {
              active: true,
              planId,
              planName,
              amount: parseFloat(amount),
              startDate: new Date().toISOString(),
              customerEmail,
              sessionId: session.id
            }
          });

          // Enviar email de confirmação
          // Implemente aqui a lógica de envio de email
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { userId } = subscription.metadata;

        if (userId) {
          await updateDoc(doc(db, 'professionals', userId), {
            'subscriptionStatus.lastPayment': {
              amount: invoice.amount_paid,
              date: new Date().toISOString(),
              invoiceId: invoice.id,
              status: 'succeeded'
            }
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { userId } = subscription.metadata;

        if (userId) {
          await updateDoc(doc(db, 'professionals', userId), {
            'subscriptionStatus.active': false,
            'subscriptionStatus.lastPayment': {
              amount: invoice.amount_due,
              date: new Date().toISOString(),
              invoiceId: invoice.id,
              status: 'failed'
            }
          });

          // Enviar email de falha no pagamento
          // Implemente aqui a lógica de envio de email
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;

        if (userId) {
          await updateDoc(doc(db, 'professionals', userId), {
            'subscriptionStatus.active': false,
            'subscriptionStatus.endDate': new Date().toISOString()
          });

          // Enviar email de cancelamento
          // Implemente aqui a lógica de envio de email
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).send('Error processing webhook');
  }
};