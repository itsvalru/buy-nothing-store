"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import { Product } from "@/types";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sales_count", { ascending: false }); // optional sort
      if (error) console.error("Failed to fetch products", error);
      else setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered =
    category === "All"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      <ProductFilter
        categories={categories}
        selected={category}
        onSelect={setCategory}
      />

      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
