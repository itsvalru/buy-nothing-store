"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import products from "@/lib/products"; // or your actual data source

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      const found = products.find((p) => p.slug === slug);
      setProduct(found);
    }
  }, [slug]);

  const [method, setMethod] = useState("creditcard");

  const handleCheckout = async () => {
    const res = await fetch("/api/mollie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, method }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (!product) return <p className="p-8">Loading product...</p>;

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">Complete Your Order</h1>

      <p className="mb-6">
        You're buying: <strong>{product.name}</strong>
        <br />
        Price: <strong>€{product.price.toFixed(2)}</strong>
      </p>

      <div className="mb-6">
        <label className="block font-semibold mb-2">
          Choose payment method:
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="creditcard"
              checked={method === "creditcard"}
              onChange={(e) => setMethod(e.target.value)}
            />
            Credit Card
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="paypal"
              onChange={(e) => setMethod(e.target.value)}
            />
            PayPal
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              value="klarna"
              onChange={(e) => setMethod(e.target.value)}
            />
            Klarna
          </label>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition"
      >
        Buy Now
      </button>
    </div>
  );
}
