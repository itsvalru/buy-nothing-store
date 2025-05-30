"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignUpForm";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-white text-black rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          \ {isLoginMode ? "Log In" : "Sign Up"}
        </h1>

        {isLoginMode ? <LoginForm /> : <SignupForm />}

        <p className="text-center text-sm mt-6">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-600 hover:underline"
          >
            {isLoginMode ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
