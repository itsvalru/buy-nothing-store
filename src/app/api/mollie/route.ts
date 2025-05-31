import { NextRequest, NextResponse } from "next/server";
import createMollieClient from "@mollie/api-client";
import { supabase } from "@/lib/supabase";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  const { product, method } = await req.json();

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !product ||
    typeof product.slug !== "string" ||
    typeof product.name !== "string" ||
    typeof product.price !== "number" ||
    !method
  ) {
    return NextResponse.json(
      { error: "Invalid product data" },
      { status: 400 }
    );
  }

  try {
    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: product.price.toFixed(2),
      },
      method,
      description: product.name,
      redirectUrl: `${req.nextUrl.origin}/success?slug=${product.slug}`,
      webhookUrl: `https://848e-2a02-8071-57a1-8c00-31fd-bb0f-d485-6b01.ngrok-free.app/api/mollie-webhook`,
      metadata: {
        slug: product.slug,
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: payment.getCheckoutUrl() });
  } catch (error: any) {
    console.error("Mollie payment error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
