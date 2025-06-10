"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TradeInboxPage() {
  const user = useUser();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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
    const fetchTrades = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("trades")
        .select(
          `
          id,
          status,
          created_at,
          sender:sender_id (id, username, display_name),
          receiver:receiver_id (id, username, display_name),
          trade_items (
            id,
            purchase_id,
            offered_by,
            purchases (
              id,
              purchase_index,
              products (name)
            )
          )
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      console.log(data);
      setTrades(data || []);
      setLoading(false);
    };

    fetchTrades();
  }, [user]);

  const respondToTrade = async (
    tradeId: string,
    action: "accepted" | "rejected"
  ) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const endpoint = `/api/${
      action === "accepted" ? "accept" : "reject"
    }-trade`;
    console.log(endpoint);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ tradeId }),
    });
    console.log(session?.access_token);
    const json = await res.json();
    if (!res.ok) {
      console.error("Trade response failed:", json.error);
      return alert("Error processing trade. Try again.");
    }

    setTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, status: action } : t))
    );
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📬 Pending Trades</h1>

      {trades.length === 0 && <p className="text-gray-400">No trades yet.</p>}

      <div className="space-y-6">
        {trades.map((trade) => {
          const isReceiver = trade.receiver.id === user?.id;
          const mine = trade.trade_items.filter(
            (item: any) => item.offered_by === user?.id
          );
          const theirs = trade.trade_items.filter(
            (item: any) => item.offered_by !== user?.id
          );

          return (
            <div key={trade.id} className="bg-[#12081c] p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">
                  Trade with{" "}
                  <Link
                    href={`/profile/${
                      isReceiver
                        ? trade.sender.username
                        : trade.receiver.username
                    }`}
                    className="text-purple-300 hover:underline"
                  >
                    @
                    {isReceiver
                      ? trade.sender.username
                      : trade.receiver.username}
                  </Link>
                </p>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-white uppercase">
                  {trade.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">🎒 You give:</h3>
                  {mine.length === 0 ? (
                    <p className="text-xs text-gray-500">Nothing</p>
                  ) : (
                    mine.map((item: any) => (
                      <div key={item.id} className="text-sm">
                        <span className="text-white font-medium">
                          {item.purchases.products.name}
                        </span>{" "}
                        <span className="text-purple-400 text-xs">
                          #{item.purchases.purchase_index}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">📦 You get:</h3>
                  {theirs.length === 0 ? (
                    <p className="text-xs text-gray-500">Nothing</p>
                  ) : (
                    theirs.map((item: any) => (
                      <div key={item.id} className="text-sm">
                        <span className="text-white font-medium">
                          {item.purchases.products.name}
                        </span>{" "}
                        <span className="text-purple-400 text-xs">
                          #{item.purchases.purchase_index}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {trade.status === "pending" && isReceiver && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => respondToTrade(trade.id, "accepted")}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToTrade(trade.id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
