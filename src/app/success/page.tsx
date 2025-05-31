"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && data) setProduct(data);
    };

    fetchProduct();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <h1 className="text-3xl font-bold mb-4">✅ Payment Successful!</h1>
      {product ? (
        <>
          <p className="text-center text-gray-400 mb-2">
            You now officially own <strong>{product.name}</strong>.
          </p>
          <p className="text-center text-gray-500 text-sm">
            This product has been sold <strong>{product.sales_count}</strong>{" "}
            time{product.sales_count !== 1 ? "s" : ""} so far.
          </p>
        </>
      ) : (
        <p className="text-gray-400">Loading product info...</p>
      )}
    </div>
  );
}
