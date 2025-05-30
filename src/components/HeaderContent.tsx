import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    <header className="bg-black text-white py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        Buy Nothing Store
      </Link>

      <nav className="space-x-4">
        <Link href="/products">Products</Link>
        <Link href="/leaderboard">Leaderboard</Link>
      </nav>

      <div className="relative" ref={dropdownRef}>
        {user ? (
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2"
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
            <span className="text-white">{user.display_name}</span>
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}

        {dropdownOpen && user && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow p-2">
            <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
              Profile
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
