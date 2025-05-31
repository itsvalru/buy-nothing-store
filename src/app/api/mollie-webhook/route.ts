import { NextRequest } from "next/server";
import createMollieClient from "@mollie/api-client";
import { supabase } from "@/lib/supabase";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const paymentId = body.get("id")?.toString();

  if (!paymentId) return new Response("Missing payment ID", { status: 400 });

  try {
    const payment = await mollie.payments.get(paymentId);
    if (payment.status !== "paid")
      return new Response("Not paid", { status: 200 });

    const { slug, user_id } = payment.metadata || {};
    if (!slug || !user_id) throw new Error("Missing metadata (slug/user_id)");

    // 💡 Check if already processed
    const { data: existing } = await supabase
      .from("mollie_payments")
      .select("id")
      .eq("id", paymentId)
      .single();

    if (existing) {
      console.log("Payment already processed:", paymentId);
      return new Response("Already processed", { status: 200 });
    }

    // Get product
    const { data: product } = await supabase
      .from("products")
      .select("id, sales_count, price")
      .eq("slug", slug)
      .single();

    if (!product) throw new Error("Product not found");

    // 1. Update sales count
    await supabase
      .from("products")
      .update({ sales_count: product.sales_count + 1 })
      .eq("id", product.id);

    // 2. Update user's total_spent
    await supabase.rpc("increment_user_total_spent", {
      uid: user_id,
      amount: product.price,
    });

    // 3. Log the payment
    await supabase.from("mollie_payments").insert({
      id: paymentId,
      product_id: product.id,
    });

    console.log("✅ Processed payment:", paymentId);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook failed", { status: 500 });
  }
}
