import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event;

  // build webhook event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error(`Webhook Error: ${err}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // check for successful payment
  if (event.type === 'charge.succeeded') {
    const { object } = event.data;
    const paymentIntent = object;
    const orderId = paymentIntent.metadata.orderId;

    // Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: paymentIntent.id,
        status: 'COMPLETED',
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });
    return NextResponse.json({ message: 'updateOrderToPaid was successful' });
  }

  return NextResponse.json({ message: 'event is not charge.succeeded' });
}
