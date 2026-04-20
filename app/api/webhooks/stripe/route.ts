import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia" as any,
});

// Webhook 핸들러는 service role 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function debugLog(runId: string, hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  fetch("http://127.0.0.1:7529/ingest/80f33f56-fa95-4064-84b2-9411d5e38be4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "6cb624",
    },
    body: JSON.stringify({
      sessionId: "6cb624",
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // #region agent log
    debugLog("baseline", "H4", "app/api/webhooks/stripe/route.ts:POST", "checkout.session.completed received", {
      eventId: event.id,
      sessionId: session.id,
      paymentIntentId: session.payment_intent ?? null,
    });
    // #endregion
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const itemsRaw = session.metadata?.items;

  if (!userId || !itemsRaw) {
    console.error("Missing metadata in session:", session.id);
    return;
  }

  let items: Array<{ productId: string; quantity: number; price: number }>;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    console.error("Failed to parse items metadata for session:", session.id);
    return;
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 1. 주문 생성
  const { data: order, error: orderError } = await supabaseAdmin
    .from("pawpalace_orders")
    .insert({
      user_id: userId,
      status: "paid",
      total_amount: totalAmount,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .select()
    .single();

  // #region agent log
  debugLog("baseline", "H4", "app/api/webhooks/stripe/route.ts:handleCheckoutCompleted", "order insert result", {
    stripeSessionId: session.id,
    hadError: Boolean(orderError),
    errorMessage: orderError?.message ?? null,
    orderId: order?.id ?? null,
  });
  // #endregion

  if (orderError || !order) {
    console.error("Failed to create order:", orderError?.message);
    return;
  }

  // 2. 주문 아이템 생성
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("pawpalace_order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Failed to create order items:", itemsError.message);
    return;
  }

  // 3. 재고 차감 (원자적 RPC)
  for (const item of items) {
    const { error: stockError } = await supabaseAdmin.rpc("decrement_stock", {
      product_id: item.productId,
      qty: item.quantity,
    });
    if (stockError) {
      console.error(`Failed to decrement stock for ${item.productId}:`, stockError.message);
    }
  }

  console.log(`Order ${order.id} created successfully for session ${session.id}`);
}
