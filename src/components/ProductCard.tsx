import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-gray-800 border border-gray-800 rounded-xl p-4 hover:scale-105 transition-transform"
    >
      <h2 className="text-xl font-bold">{product.name}</h2>
      <p className="text-sm text-gray-400 mb-2">{product.description}</p>
      <span className="text-sm bg-gray-700 px-2 py-1 rounded">
        {product.category}
      </span>
      <div className="mt-4 font-semibold">€{product.price.toFixed(2)}</div>
    </Link>
  );
}
