import { NextRequest, NextResponse } from "next/server";
import createMollieClient from "@mollie/api-client";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  const { product, method } = await req.json();

  try {
    console.log("Creating payment for:", product);

    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: product.price.toFixed(2),
      },
      method: method, // ← here
      description: product.name,
      redirectUrl: `${req.nextUrl.origin}/success`,
      metadata: {
        slug: product.slug,
      },
    });

    return NextResponse.json({ url: payment.getCheckoutUrl() });
  } catch (error: any) {
    console.error("Mollie payment error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
