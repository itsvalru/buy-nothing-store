"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Login result:", data, error);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/"); // redirect to homepage
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Login</h2>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full p-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition"
      >
        Login
      </button>
    </form>
  );
}
