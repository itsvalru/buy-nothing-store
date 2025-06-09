"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

export default function HeaderContent() {
  const user = useUser();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-black text-white py-4 px-6 border-b border-white/10 shadow-sm sticky top-0 z-50 h-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hidden md:block"
        >
          Buy Nothing Store
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/products" className="hover:text-gray-300 transition">
            Products
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-300 transition">
            Leaderboard
          </Link>
          <Link href="/trade" className="hover:text-gray-300 transition">
            Trade Center
          </Link>
          <Link href="/trade/inbox" className="hover:text-gray-300 transition">
            Inbox
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* User dropdown */}
        <div className="relative ml-4" ref={dropdownRef}>
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
              <span className="hidden sm:inline">{user.display_name}</span>
              <ChevronDown size={16} />
            </button>
          ) : (
            <Link
              href="/login"
              className="md:inline bg-white text-black font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              Login
            </Link>
          )}

          {dropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">
              <Link
                href={`/profile/${user.username}`}
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

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-2 text-sm font-medium px-2">
          <Link
            href="/"
            className="block py-2 px-3 rounded hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Homepage
          </Link>
          <Link
            href="/products"
            className="block py-2 px-3 rounded hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/leaderboard"
            className="block py-2 px-3 rounded hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/trade"
            className="block py-2 px-3 rounded hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Trade Center
          </Link>
          <Link
            href="/trade/inbox"
            className="block py-2 px-3 rounded hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inbox
          </Link>
          {!user && (
            <Link
              href="/login"
              className="block py-2 px-3 rounded bg-white text-black font-semibold hover:bg-gray-200 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
