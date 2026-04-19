import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function POST(request: NextRequest) {
  // 인증 확인
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let items: CheckoutItem[];
  try {
    const body = await request.json() as { items: CheckoutItem[] };
    items = body.items;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "장바구니가 비어있습니다." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: { productId: item.productId },
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId: user.id,
        items: JSON.stringify(items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        }))),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "결제 세션 생성에 실패했습니다." }, { status: 500 });
  }
}
