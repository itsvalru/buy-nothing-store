// app/api/lootbox-webhook/route.ts
import { NextRequest } from "next/server";
import createMollieClient from "@mollie/api-client";
import { createClient } from "@supabase/supabase-js";

// Service role access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const paymentId = body.get("id")?.toString();

  if (!paymentId) return new Response("Missing payment ID", { status: 400 });

  try {
    const payment = await mollie.payments.get(paymentId);
    if (payment.status !== "paid")
      return new Response("Not paid", { status: 200 });

    const metadata = payment.metadata as {
      slug?: string;
      user_id?: string;
      rarity?: string;
      quantity?: number;
      is_lootbox?: boolean;
    };

    const { user_id, rarity, quantity, is_lootbox } = metadata;

    if (!user_id || !rarity || !quantity || !is_lootbox)
      throw new Error("Missing or invalid lootbox metadata");

    const { data: existing } = await supabaseAdmin
      .from("mollie_payments")
      .select("id")
      .eq("id", paymentId)
      .single();

    if (existing) {
      console.log("⚠️ Lootbox payment already handled:", paymentId);
      return new Response("Already processed", { status: 200 });
    }

    await supabaseAdmin.from("mollie_payments").insert({
      id: paymentId,
      product_id: null,
    });

    const lootboxes = Array.from({ length: quantity }, () => ({
      user_id,
      rarity,
      type: "purchase",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("lootboxes")
      .insert(lootboxes);

    if (insertError) {
      console.error("❌ Failed to insert lootboxes:", insertError);
      throw insertError;
    }

    // 💰 Update total_spent
    const priceMap: Record<string, number> = {
      common: 1,
      rare: 5,
      epic: 50,
      legendary: 500,
    };

    const spent = (priceMap[rarity] || 0) * quantity;

    const { error: spendError } = await supabaseAdmin.rpc(
      "increment_user_total_spent",
      {
        uid: user_id,
        amount: spent,
      }
    );

    if (spendError) {
      console.error("❌ Failed to update total_spent:", spendError);
      throw spendError;
    }

    console.log(
      `✅ Granted ${quantity} ${rarity} lootbox(es) and added €${spent} to ${user_id}`
    );
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Lootbox Webhook Error:", err);
    return new Response("Webhook failed", { status: 500 });
  }
}
