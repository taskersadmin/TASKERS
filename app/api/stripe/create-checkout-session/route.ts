import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPriceIdForService } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const priceId = getPriceIdForService(job.serviceType);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/review/${jobId}`,
      metadata: { jobId: job.id },
    });

    await prisma.payment.create({
      data: {
        jobId: job.id,
        stripeCheckoutSessionId: session.id,
        amount: job.serviceType === 'MINUTES_30' ? 7500 : job.serviceType === 'MINUTES_60' ? 12500 : 5000,
        status: 'pending',
        type: 'initial',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
