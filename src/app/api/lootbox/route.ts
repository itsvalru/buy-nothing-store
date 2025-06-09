// app/api/lootbox/route.ts
import { NextRequest, NextResponse } from "next/server";
import createMollieClient from "@mollie/api-client";
import { supabase } from "@/lib/supabase";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  const { rarity, amount, method } = await req.json();

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceMap: Record<string, number> = {
    common: 1,
    rare: 5,
    epic: 50,
    legendary: 500,
  };

  const unitPrice = priceMap[rarity];
  if (!unitPrice || amount <= 0) {
    return NextResponse.json(
      { error: "Invalid lootbox data" },
      { status: 400 }
    );
  }

  const totalPrice = unitPrice * amount;
  console.log("🔐 Auth header:", req.headers.get("authorization"));
  try {
    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: totalPrice.toFixed(2),
      },
      method,
      description: `${amount}x ${rarity} Lootbox`,
      redirectUrl: `${req.nextUrl.origin}/success`,
      webhookUrl: `https://bb55-2a02-8071-57a1-8c00-6c26-1512-a6b3-a595.ngrok-free.app/api/lootbox-webhook`,
      metadata: {
        user_id: user.id,
        rarity,
        quantity: amount,
        is_lootbox: true,
        slug: `lootbox-${rarity}-${Date.now()}`,
      },
    });

    return NextResponse.json({ url: payment.getCheckoutUrl() });
  } catch (error: any) {
    console.error("Mollie lootbox payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
