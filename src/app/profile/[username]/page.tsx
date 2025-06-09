"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");

  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (!userProfile) {
        setLoading(false);
        return;
      }

      setProfile(userProfile);

      const { data: userPurchases } = await supabase
        .from("purchases")
        .select("*, products(name)")
        .eq("user_id", userProfile.id);

      setPurchases(userPurchases || []);
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  const toggleHighlight = async (purchaseId: number, current: boolean) => {
    const currentlyHighlighted = purchases.filter((p) => p.highlighted).length;

    if (!current && currentlyHighlighted >= 3) {
      alert("You can only showcase up to 3 items.");
      return;
    }

    const { error } = await supabase
      .from("purchases")
      .update({ highlighted: !current })
      .eq("id", purchaseId);

    if (!error) {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId ? { ...p, highlighted: !current } : p
        )
      );
    }
  };

  const filteredAndSorted = purchases
    .filter((item) =>
      item.products.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name-asc")
        return a.products.name.localeCompare(b.products.name);
      if (sort === "name-desc")
        return b.products.name.localeCompare(a.products.name);
      if (sort === "date-asc")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  if (loading) return <div className="p-8 text-white">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-red-400">User not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={profile.avatar_url || "/default-avatar.png"}
          alt="avatar"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-sm text-purple-400">@{profile.username}</p>
          <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>
        </div>
      </div>

      <p className="text-purple-300 font-medium mb-10">
        Total Spent: ${parseFloat(profile.total_spent).toFixed(2)}
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-2">🌟 Showcased Nothings</h2>
        {purchases.filter((p) => p.highlighted).length === 0 && (
          <p className="text-gray-500">No items showcased.</p>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {purchases
            .filter((item) => item.highlighted)
            .map((item) => (
              <div key={item.id} className="bg-[#1a102a] p-4 rounded-lg">
                <p className="text-white font-bold">{item.products.name}</p>
                <p className="text-sm text-gray-500">#{item.purchase_index}</p>
                <p className="text-xs text-purple-400">
                  {item.products.rarity}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => toggleHighlight(item.id, item.highlighted)}
                    className="mt-2 text-xs text-blue-300 hover:underline"
                  >
                    Remove from showcase
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">🎒 Inventory</h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {filteredAndSorted.map((item) => (
            <div key={item.id} className="bg-[#0d0614] p-4 rounded-lg">
              <p className="text-white font-bold">{item.products.name}</p>
              <p className="text-sm text-gray-500">#{item.purchase_index}</p>
              <p className="text-xs text-purple-400">{item.products.rarity}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(item.created_at).toLocaleString()}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => toggleHighlight(item.id, item.highlighted)}
                  className="mt-2 text-xs text-blue-300 hover:underline"
                >
                  {item.highlighted
                    ? "Remove from showcase"
                    : "Highlight this item"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
