"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<any>(null);
  const [method, setMethod] = useState("creditcard");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          return;
        }

        setProduct(data);
      };

      fetchProduct();
    }
  }, [slug]);

  const handleCheckout = async () => {
    if (!product) return;

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/mollie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ product, method }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Checkout error:", data.error || "Unknown error");
      alert("Something went wrong during checkout.");
    }
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
          {["creditcard", "paypal", "klarna"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="method"
                value={opt}
                checked={method === opt}
                onChange={(e) => setMethod(e.target.value)}
              />
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Buy Now"}
      </button>
    </div>
  );
}
