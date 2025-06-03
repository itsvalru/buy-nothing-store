"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function HeaderContent() {
  const user = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-black text-white py-4 px-6 border-b border-white/10 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Buy Nothing Store
        </Link>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/products" className="hover:text-gray-300 transition">
            Products
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-300 transition">
            Leaderboard
          </Link>
        </nav>

        <div className="relative" ref={dropdownRef}>
          {user ? (
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <Image
                src={
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/thumbs/png?seed=${
                    user.display_name || "default"
                  }`
                }
                alt={user.display_name || "User avatar"}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>{user.display_name}</span>
              <ChevronDown size={16} />
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-white text-black font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              Login
            </Link>
          )}

          {dropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">
              <Link
                href="/profile"
                className="block px-4 py-3 hover:bg-gray-100 transition"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-3 hover:bg-gray-100 transition"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
