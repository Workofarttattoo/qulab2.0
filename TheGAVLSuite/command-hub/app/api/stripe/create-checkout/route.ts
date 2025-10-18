import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('stripe-checkout-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        trackApiRequest('POST', '/api/stripe/create-checkout', Date.now() - startTime, 401);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { priceId } = body;

      if (!priceId) {
        trackApiRequest('POST', '/api/stripe/create-checkout', Date.now() - startTime, 400);
        return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
      }

      span.setAttributes({
        'user.id': session.user.id,
        'stripe.price_id': priceId,
      });

      const checkoutSession = await createCheckoutSession(session.user.id, priceId);

      trackApiRequest('POST', '/api/stripe/create-checkout', Date.now() - startTime, 200);

      return NextResponse.json({
        url: checkoutSession.url
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/stripe/create-checkout',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/stripe/create-checkout', Date.now() - startTime, 500);

      return NextResponse.json({
        error: 'Failed to create checkout session'
      }, { status: 500 });
    }
  });
}
