"use client";

import { useState } from "react";
import SignUpForm from "@/components/SignUpForm";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {isSignup ? "Sign Up" : "Log In"}
      </h1>

      {isSignup ? (
        <SignUpForm />
      ) : (
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow text-black"
        >
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Log In
          </button>
        </form>
      )}

      <button
        onClick={() => setIsSignup(!isSignup)}
        className="mt-4 text-sm text-gray-500 hover:underline"
      >
        {isSignup
          ? "Already have an account? Log in"
          : "Don't have an account? Sign up"}
      </button>
    </main>
  );
}
