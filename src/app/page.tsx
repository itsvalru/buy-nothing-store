import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Buy-Nothing.Store</h1>
      <p className="text-center max-w-xl text-gray-400 mb-8">
        We sell literally nothing. Joke products, dumb ideas, pure meme energy.
        Buy nothing, own it anyway.
      </p>
      <a
        href="/products"
        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
      >
        Browse Products
      </a>
    </main>
  );
}
