"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion } from "framer-motion";

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

  const paymentOptions = [
    {
      id: "creditcard",
      label: "Credit Card",
      icon: "/icons/creditcard.svg",
    },
    {
      id: "paypal",
      label: "PayPal",
      icon: "/icons/paypal.svg",
    },
    {
      id: "klarna",
      label: "Klarna",
      icon: "/icons/klarna.svg",
    },
  ];

  if (!product)
    return <p className="p-8 text-center text-gray-400">Loading product...</p>;

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🛒 Complete Your Order
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow">
        <p className="text-lg mb-2">
          You're buying: <strong>{product.name}</strong>
        </p>
        <p className="text-gray-400">
          Price: <strong>€{product.price.toFixed(2)}</strong>
        </p>
      </div>

      <div className="mb-8">
        <label className="block font-semibold mb-3 text-white">
          Choose payment method:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {paymentOptions.map((opt) => {
            const selected = method === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                  selected
                    ? "bg-white text-black border-white"
                    : "bg-gray-800 text-white border-gray-600 hover:border-white/40"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={opt.icon}
                  alt={opt.label}
                  width={36}
                  height={36}
                  className="mb-2"
                />
                <span className="text-sm font-medium">{opt.label}</span>

                {selected && (
                  <motion.div
                    className="absolute top-2 right-2 bg-green-500 text-xs text-white px-1.5 py-0.5 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
        className="w-full bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Buy Now"}
      </button>
    </div>
  );
}
