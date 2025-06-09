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

    if (!slug || !user_id) throw new Error("Missing slug or user_id");

    // Avoid duplicate webhook handling
    const { data: existing } = await supabase
      .from("mollie_payments")
      .select("id")
      .eq("id", paymentId)
      .single();

    if (existing) {
      console.log("⚠️ Payment already processed:", paymentId);
      return new Response("Already processed", { status: 200 });
    }

    // Fetch product by slug
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, sales_count, price")
      .eq("slug", slug)
      .single();

    if (productError || !product) throw new Error("Product not found");

    // Update sales count
    const { error: updateError } = await supabase
      .from("products")
      .update({ sales_count: product.sales_count + 1 })
      .eq("id", product.id);
    if (updateError) throw updateError;

    // Update total_spent
    const { error: rpcError } = await supabase.rpc(
      "increment_user_total_spent",
      {
        uid: user_id,
        amount: product.price,
      }
    );

    if (rpcError) {
      console.error("❌ RPC failed:", rpcError);
      const { error: fallbackErr } = await supabase
        .from("users")
        .update({
          total_spent: supabase.raw("total_spent + ?", [product.price]),
        })
        .eq("id", user_id);
      if (fallbackErr) throw fallbackErr;
    }

    // Log payment to mollie_payments
    await supabase.from("mollie_payments").insert({
      id: paymentId,
      product_id: product.id,
    });

    // Insert into purchases
    const { error: purchaseError } = await supabase.from("purchases").insert({
      user_id,
      product_id: product.id,
    });

    if (purchaseError) {
      console.error("❌ Failed to insert purchase:", purchaseError);
      throw purchaseError;
    }

    console.log("✅ Webhook handled successfully");
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Webhook failed", { status: 500 });
  }
}
