"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return setErrorMsg(error.message);
      router.push("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user)
        return setErrorMsg(error?.message || "No user returned");

      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        display_name: displayName,
        avatar_url: avatarUrl || null,
      });

      if (insertError)
        return setErrorMsg("User insert failed: " + insertError.message);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleAuth}
        className="space-y-4 max-w-md w-full bg-zinc-900 p-6 rounded-lg shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Display Name"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Avatar URL (optional)"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black font-bold p-2 rounded hover:bg-gray-200 transition"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        <p className="text-sm text-center text-zinc-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </form>
    </div>
  );
}
