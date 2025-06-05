import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BuyButton from "@/components/BuyButton";
import Link from "next/link";

interface ProductDetailProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const { data: products, error } = await supabase
    .from("products")
    .select("slug");

  if (error || !products) {
    console.error("Failed to fetch slugs:", error?.message);
    return [];
  }

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!product || error) {
    notFound();
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/products"
        className="text-sm text-gray-400 hover:underline mb-6 inline-block"
      >
        ← Back to Products
      </Link>

      <div className="bg-gray-800 p-6 rounded-xl shadow-md">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          {product.name}
        </h1>
        <p className="text-gray-400 mb-4 text-lg">{product.description}</p>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="bg-gray-700 text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-2xl font-bold text-green-400">
            €{product.price.toFixed(2)}
          </span>
        </div>

        <BuyButton product={product} />
      </div>
    </div>
  );
}
