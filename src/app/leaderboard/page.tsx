import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { data: topBuyersData } = await supabase.rpc("get_top_buyers");
  const { data: topProductsData } = await supabase.rpc("get_top_products");

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Top Buyers</h2>
        <ul className="space-y-2">
          {topBuyersData?.map((user: any, index: number) => (
            <motion.li
              key={user.id}
              className="flex items-center justify-between bg-white text-black px-4 py-2 rounded shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.display_name}`
                  }
                  alt={user.display_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>
                  #{index + 1} {user.display_name}
                </span>
              </div>
              <span>€{user.total_spent.toFixed(2)}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Top Products</h2>
        <ul className="space-y-2">
          {topProductsData?.map((product: any, index: number) => (
            <motion.li
              key={product.id}
              className="flex justify-between bg-white text-black px-4 py-2 rounded shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>
                #{index + 1} {product.name}
              </span>
              <span>Sold: {product.total_purchases}</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </main>
  );
}
