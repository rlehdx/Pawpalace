import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error: Stripe SDK types lag behind latest API version
  apiVersion: "2026-03-25.dahlia",
});

interface CheckoutItem {
  productId: string;
  name: string;
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
    const body = await request.json() as { items?: CheckoutItem[] };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    items = body.items;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "장바구니가 비어있습니다." }, { status: 400 });
  }

  // 수량 검증
  for (const item of items) {
    if (!item.productId || typeof item.productId !== "string") {
      return NextResponse.json({ error: "잘못된 상품 ID입니다." }, { status: 400 });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return NextResponse.json({ error: "잘못된 수량입니다." }, { status: 400 });
    }
  }

  // DB에서 실제 가격 조회 (가격 조작 방지)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const productIds = items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabaseAdmin
    .from("pawpalace_products")
    .select("id, name, price, images, is_active, stock")
    .in("id", productIds);

  if (productsError || !products) {
    console.error("Failed to fetch products:", productsError);
    return NextResponse.json({ error: "상품 정보를 가져올 수 없습니다." }, { status: 500 });
  }

  // 모든 상품이 존재하는지, 활성 상태인지, 재고가 있는지 확인
  const productMap = new Map(products.map((p) => [p.id, p]));
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `상품을 찾을 수 없습니다: ${item.productId}` }, { status: 400 });
    }
    if (!product.is_active) {
      return NextResponse.json({ error: `판매 중단된 상품입니다: ${product.name}` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `재고가 부족합니다: ${product.name}` }, { status: 400 });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL is not set");
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: items.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              images: item.image ? [item.image] : (product.images?.slice(0, 1) ?? []),
              metadata: { productId: item.productId },
            },
            unit_amount: Math.round(Number(product.price) * 100), // 서버에서 가져온 실제 가격
          },
          quantity: item.quantity,
        };
      }),
      metadata: {
        userId: user.id,
        items: JSON.stringify(items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: productMap.get(i.productId)!.price, // 서버 가격 사용
        }))),
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });

    if (!session.url) {
      console.error("Stripe session created but no URL returned:", session.id);
      return NextResponse.json({ error: "결제 URL을 가져올 수 없습니다." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "결제 세션 생성에 실패했습니다." }, { status: 500 });
  }
}
