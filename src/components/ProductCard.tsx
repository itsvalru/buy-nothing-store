import { Product } from "@/types";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-[#1a102a] border border-white/10 rounded-xl p-4 hover:scale-105 transition-transform shadow-md"
    >
      <h2 className="text-white text-xl font-bold mb-1">{product.name}</h2>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {product.description}
      </p>

      <span className="text-xs bg-[#370e79] text-white px-2 py-1 rounded-full">
        {product.category}
      </span>

      <div className="mt-4 text-green-400 font-semibold">
        €{product.price.toFixed(2)}
      </div>
    </Link>
  );
}
