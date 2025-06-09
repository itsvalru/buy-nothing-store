"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<Product | null>(null);
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

  const paymentOptions = [
    { id: "creditcard", label: "Credit Card", icon: "/icons/creditcard.svg" },
    { id: "paypal", label: "PayPal", icon: "/icons/paypal.svg" },
    { id: "klarna", label: "Klarna", icon: "/icons/klarna.svg" },
  ];

  if (!product)
    return <p className="p-8 text-center text-gray-400">Loading product...</p>;

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-bold mb-10 text-center">
        🛒 Complete Your Order
      </h1>

      <div className="bg-[#1a102a] p-6 rounded-xl mb-10 border border-white/10 shadow-md">
        <p className="text-lg mb-1">
          You're buying:{" "}
          <span className="text-purple-400 font-semibold">{product.name}</span>
        </p>
        <p className="text-gray-400">
          Price:{" "}
          <span className="text-green-400 font-bold">
            €{product.price.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="mb-10">
        <label className="block font-semibold mb-3 text-white">
          Choose payment method:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentOptions.map((opt) => {
            const selected = method === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition text-sm font-medium ${
                  selected
                    ? "bg-white text-black border-white"
                    : "bg-gray-900 text-white border-gray-700 hover:border-purple-500"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <Image
                  src={opt.icon}
                  alt={opt.label}
                  width={32}
                  height={32}
                  className="mb-2"
                />
                {opt.label}

                {selected && (
                  <motion.div
                    className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    ✔
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Buy Now"}
      </button>
    </div>
  );
}
