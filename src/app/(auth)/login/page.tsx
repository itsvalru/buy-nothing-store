"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignUpForm";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-black text-white px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-6"></h1>

        {isLoginMode ? <LoginForm /> : <SignupForm />}

        <div className="mt-4 text-center text-sm text-gray-400">
          {isLoginMode ? "Don’t have an account?" : "Already registered?"}{" "}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-400 hover:underline font-medium"
          >
            {isLoginMode ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
