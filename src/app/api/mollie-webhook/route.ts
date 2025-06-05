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

    const metadata = payment.metadata as { slug?: string; user_id?: string };

    const slug = metadata.slug;
    const user_id = metadata.user_id;
    console.log("📦 Webhook metadata:", payment.metadata);

    if (!slug || !user_id) throw new Error("Missing slug or user_id");

    const { data: existing } = await supabase
      .from("mollie_payments")
      .select("id")
      .eq("id", paymentId)
      .single();

    if (existing) {
      console.log("⚠️ Payment already processed:", paymentId);
      return new Response("Already processed", { status: 200 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, sales_count, price")
      .eq("slug", slug)
      .single();
    console.log("📦 Product fetched:", product);
    if (productError || !product) throw new Error("Product not found");

    // 1. Update product sales
    await supabase
      .from("products")
      .update({ sales_count: product.sales_count + 1 })
      .eq("id", product.id);

    // 2. Try increment_user_total_spent RPC
    const { error: rpcError } = await supabase.rpc(
      "increment_user_total_spent",
      {
        uid: user_id,
        amount: product.price,
      }
    );

    if (rpcError) {
      console.error("❌ RPC failed:", rpcError);

      // 3. Try direct fallback update
      const { error: fallbackErr } = await supabase
        .from("users")
        .update({
          total_spent: supabase.raw("total_spent + ?", [product.price]),
        })
        .eq("id", user_id);

      if (fallbackErr) {
        console.error("❌ Direct update failed too:", fallbackErr);
        throw fallbackErr;
      } else {
        console.log("✅ Fallback total_spent update succeeded");
      }
    } else {
      console.log("✅ RPC total_spent update succeeded");
    }

    // 4. Log payment
    await supabase.from("mollie_payments").insert({
      id: paymentId,
      product_id: product.id,
    });

    console.log("✅ Webhook success for payment:", paymentId);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook failed", { status: 500 });
  }
}
