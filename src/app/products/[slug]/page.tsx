import { products } from "@/lib/products";
import { notFound } from "next/navigation";
import BuyButton from "@/components/BuyButton";
import Link from "next/link";

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetail({
  params,
}: {
  params: { slug: string };
}) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  console.log("ENV STRIPE KEY:", process.env.STRIPE_SECRET_KEY);

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <Link href="/products" className="text-sm text-gray-400 hover:underline">
        ← Back to Products
      </Link>

      <h1 className="text-4xl font-bold mt-4 mb-2">{product.name}</h1>
      <p className="text-gray-400 mb-4">{product.description}</p>

      <span className="inline-block bg-gray-700 text-sm px-3 py-1 rounded-full mb-4">
        {product.category}
      </span>

      <div className="text-xl font-semibold mb-6">
        €{product.price.toFixed(2)}
      </div>

      <BuyButton product={product} />
    </div>
  );
}
