"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

const rarityGlow: Record<string, string> = {
  common: "shadow-[0_0_6px_#9ca3af]",
  rare: "shadow-[0_0_6px_#60a5fa]",
  epic: "shadow-[0_0_6px_#a78bfa]",
  legendary: "shadow-[0_0_8px_#f97316]",
};

const rarityTextColors: Record<string, string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
};

const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export default function TradeNewPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUsername = searchParams.get("to");

  const [targetUser, setTargetUser] = useState<any>(null);
  const [targetInventory, setTargetInventory] = useState<any[]>([]);
  const [myInventory, setMyInventory] = useState<any[]>([]);
  const [selectedMine, setSelectedMine] = useState<string[]>([]);
  const [selectedTheirs, setSelectedTheirs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [myPage, setMyPage] = useState(0);
  const [theirPage, setTheirPage] = useState(0);

  const maxMyPages = Math.ceil(myInventory.length / 10);
  const maxTheirPages = Math.ceil(targetInventory.length / 10);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!targetUsername || !user) return;

      const { data: target } = await supabase
        .from("users")
        .select("*")
        .eq("username", targetUsername)
        .single();

      setTargetUser(target);

      const [{ data: theirs }, { data: mine }] = await Promise.all([
        supabase
          .from("purchases")
          .select("id, products(name, price, rarity, category), purchase_index")
          .eq("user_id", target?.id),

        supabase
          .from("purchases")
          .select("id, products(name, price, rarity, category), purchase_index")
          .eq("user_id", user.id),
      ]);

      setTargetInventory(theirs || []);
      setMyInventory(mine || []);
    };

    fetchData();
  }, [targetUsername, user]);

  const toggleSelect = (id: string, from: "mine" | "theirs") => {
    if (from === "mine") {
      setSelectedMine((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedTheirs((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const sendTrade = async () => {
    if (!user || !targetUser) return;
    if (selectedMine.length === 0 && selectedTheirs.length === 0) {
      alert("You must offer or request at least one item.");
      return;
    }

    setLoading(true);

    const { data: trade, error } = await supabase
      .from("trades")
      .insert({
        sender_id: user.id,
        receiver_id: targetUser.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (!trade || error) {
      alert("Error creating trade.");
      setLoading(false);
      return;
    }

    const offers = [
      ...selectedMine.map((id) => ({
        trade_id: trade.id,
        purchase_id: id,
        offered_by: user.id,
      })),
      ...selectedTheirs.map((id) => ({
        trade_id: trade.id,
        purchase_id: id,
        offered_by: targetUser.id,
      })),
    ];

    const { error: itemsError } = await supabase
      .from("trade_items")
      .insert(offers);

    setLoading(false);

    if (itemsError) {
      alert("Failed to attach trade items.");
    } else {
      alert("Trade request sent!");
      router.push(`/profile/${user.username}`);
    }
  };

  if (!targetUser) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Trading with @{targetUser.username}
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">🎒 Your Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myInventory.slice(myPage * 10, myPage * 10 + 10).map((item) => {
              const isLootbox = item.products.category === "Lootbox";
              const rarity = item.products.rarity;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id, "mine")}
                  className={`cursor-pointer border p-3 rounded transition-all ${
                    selectedMine.includes(item.id)
                      ? "border-green-400 bg-green-950"
                      : "border-gray-700 bg-[#0d0614]"
                  } ${isLootbox ? rarityGlow[rarity] : ""}`}
                >
                  <p className="font-bold truncate">{item.products.name}</p>
                  <p className="text-sm text-gray-500">
                    #{item.purchase_index}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isLootbox ? rarityTextColors[rarity] : "text-purple-400"
                    }`}
                  >
                    {isLootbox
                      ? capitalizeFirst(rarity)
                      : item.products.price
                      ? `$${item.products.price}`
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <button
              disabled={myPage === 0}
              onClick={() => setMyPage((p) => Math.max(p - 1, 0))}
            >
              ◀ Prev
            </button>
            <span>
              Page {myPage + 1} / {maxMyPages}
            </span>
            <button
              disabled={myPage + 1 >= maxMyPages}
              onClick={() => setMyPage((p) => p + 1)}
            >
              Next ▶
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            📦 {targetUser.display_name}'s Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {targetInventory
              .slice(theirPage * 10, theirPage * 10 + 10)
              .map((item) => {
                const isLootbox = item.products.category === "Lootbox";
                const rarity = item.products.rarity;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id, "theirs")}
                    className={`cursor-pointer border p-3 rounded transition-all ${
                      selectedTheirs.includes(item.id)
                        ? "border-blue-400 bg-blue-950"
                        : "border-gray-700 bg-[#0d0614]"
                    } ${isLootbox ? rarityGlow[rarity] : ""}`}
                  >
                    <p className="font-bold truncate">{item.products.name}</p>
                    <p className="text-sm text-gray-500">
                      #{item.purchase_index}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isLootbox ? rarityTextColors[rarity] : "text-purple-400"
                      }`}
                    >
                      {isLootbox
                        ? capitalizeFirst(rarity)
                        : item.products.price
                        ? `$${item.products.price}`
                        : ""}
                    </p>
                  </div>
                );
              })}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <button
              disabled={theirPage === 0}
              onClick={() => setTheirPage((p) => Math.max(p - 1, 0))}
            >
              ◀ Prev
            </button>
            <span>
              Page {theirPage + 1} / {maxTheirPages}
            </span>
            <button
              disabled={theirPage + 1 >= maxTheirPages}
              onClick={() => setTheirPage((p) => p + 1)}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={sendTrade}
        disabled={loading}
        className="bg-white text-black px-6 py-3 font-bold rounded hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Trade Request"}
      </button>
    </div>
  );
}
