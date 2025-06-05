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

    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 text-white w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center">Welcome Back</h2>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
