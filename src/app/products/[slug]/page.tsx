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
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-12 text-white">
      <Link
        href="/products"
        className="text-sm text-white/60 hover:text-white transition mb-8 inline-block"
      >
        ← Back to Product List
      </Link>

      <div className="bg-[#1a102a] border border-white/10 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-400 mb-6 text-lg">{product.description}</p>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="bg-[#370e79] text-xs uppercase tracking-wide font-medium px-3 py-1 rounded-full">
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
