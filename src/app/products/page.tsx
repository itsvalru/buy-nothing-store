"use client";

import { useState } from "react";
import { products as allProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";

export default function ProductPage() {
  const [category, setCategory] = useState("All");

  const categories = [...new Set(allProducts.map((p) => p.category))];
  const products =
    category === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === category);

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      <ProductFilter
        categories={categories}
        selected={category}
        onSelect={setCategory}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
