"use client";

type BuyButtonProps = {
  product: {
    name: string;
    description: string;
    price: number;
    slug: string;
  };
};

export default function BuyButton({ product }: BuyButtonProps) {
  const buyProduct = () => {
    window.location.href = `/checkout?slug=${product.slug}`;
  };

  return (
    <button
      onClick={buyProduct}
      className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-300 transition"
    >
      Buy Now
    </button>
  );
}
