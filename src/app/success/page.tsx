"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const registerPurchase = async () => {
      if (!product || !product.uuid) return;

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error("Not authenticated");
        return;
      }

      const { data: existingPurchase, error: checkError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", authUser.id)
        .eq("product_id", product.uuid) // ✅ FIXED
        .maybeSingle();

      if (checkError) {
        console.error("Error checking purchase:", checkError.message);
        return;
      }

      if (!existingPurchase) {
        const { error: incrementError } = await supabase.rpc(
          "increment_total_spent",
          {
            amount: product.price || 0,
          }
        );

        if (incrementError) {
          console.error(
            "Failed to increment total_spent:",
            incrementError.message
          );
          return;
        }

        const { error: insertError } = await supabase.from("purchases").insert({
          user_id: authUser.id,
          product_id: product.uuid, // ✅ FIXED
          amount: product.price || 0,
        });

        if (insertError) {
          console.error("Failed to record purchase:", insertError.message);
        } else {
          console.log("✅ total_spent updated and purchase saved.");
        }
      } else {
        console.log("⚠️ Purchase already exists. Skipping update.");
      }
    };

    registerPurchase();
  }, [product]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <h1 className="text-3xl font-bold mb-4 text-center">
        ✅ Payment Successful!
      </h1>
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
