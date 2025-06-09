"use client";

import { useState, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const rarities = ["common", "rare", "epic", "legendary"] as const;

const rarityMeta: Record<
  (typeof rarities)[number],
  { color: string; price: number }
> = {
  common: { color: "gray", price: 1 },
  rare: { color: "blue", price: 5 },
  epic: { color: "purple", price: 50 },
  legendary: { color: "orange", price: 500 },
};

export default function LootboxStore() {
  const user = useUser();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  });

  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(() => {
    return rarities.reduce((sum, rarity) => {
      return sum + quantities[rarity] * rarityMeta[rarity].price;
    }, 0);
  }, [quantities]);

  const handleBuy = async (rarity: string, amount: number) => {
    if (!user?.id || amount <= 0) return;

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/lootbox", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        rarity,
        amount,
        method: null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Lootbox checkout error:", data.error || "Unknown error");
      alert("Something went wrong during lootbox purchase.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-bold mb-10 text-center">🛒 Buy Lootboxes</h1>

      <div className="grid grid-cols-2 gap-6">
        {rarities.map((rarity) => {
          const meta = rarityMeta[rarity];
          return (
            <div
              key={rarity}
              className={`p-4 rounded-xl bg-[#0d0614] border border-${meta.color}-500`}
            >
              <h2
                className={`text-${meta.color}-400 text-xl font-bold capitalize`}
              >
                {rarity}
              </h2>
              <p className="text-sm mb-3 text-gray-300">
                Price: €{meta.price} each
              </p>

              <input
                type="number"
                min={0}
                value={quantities[rarity]}
                onChange={(e) =>
                  setQuantities((q) => ({
                    ...q,
                    [rarity]: parseInt(e.target.value || "0"),
                  }))
                }
                className="w-full bg-gray-800 text-white p-2 rounded mb-3"
              />

              <button
                onClick={() => handleBuy(rarity, quantities[rarity])}
                disabled={loading || quantities[rarity] <= 0}
                className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : `Buy ${quantities[rarity] || 0}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="mt-10 text-center">
        <p className="text-lg font-semibold mb-2">
          🧾 Total Selected:{" "}
          <span className="text-green-400 font-bold">€{totalPrice}</span>
        </p>
      </div>

      {/* Back Button */}
      <div className="mt-2 text-center">
        <Link
          href="/lootbox"
          className="inline-block mt-6 text-sm bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition border border-white/10 shadow"
        >
          🎁 Back to Lootbox Inventory
        </Link>
      </div>
    </div>
  );
}
