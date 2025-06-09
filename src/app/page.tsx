"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className=" bg-gradient-to-b from-black via-[#0b021f] to-[#100622] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background vortex animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute w-[200vw] h-[200vh] bg-gradient-radial from-purple-900/30 via-blue-900/10 to-black rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          style={{ top: "-50%", left: "-50%" }}
        />
      </div>

      {/* Hero Content */}
      <div className="min-h-[calc(100vh-5rem)] z-10 text-center flex justify-center items-center">
        <div>
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Buy Nothing. Own Everything.
          </motion.h1>

          <motion.p
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 min-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            Joke products. Dumb ideas. Meme investments. Join the movement and
            spend your money on absolutely nothing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative inline-block"
          >
            <div className="relative group inline-block">
              <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500 group-hover:animate-glow-ring transition-all duration-300 pointer-events-none" />
              <Link
                href="/products"
                className="relative bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Start Buying Nothing
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            "Best investment I ever made." – Some guy who bought 23 nothings
          </motion.div>
        </div>
      </div>

      {/* New Sections Below */}
      <div className="z-10 mt-4 max-w-4xl w-full">
        {/* How it works */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <p className="text-gray-400 mb-6">
            It's dumb. It's easy. It's beautiful.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a102a] p-6 rounded-xl shadow-xl">
              <p className="font-bold text-xl mb-2">1. Pick a Product</p>
              <p className="text-gray-400">
                Choose from hundreds of useless joke items.
              </p>
            </div>
            <div className="bg-[#1a102a] p-6 rounded-xl shadow-xl">
              <p className="font-bold text-xl mb-2">2. Buy Nothing</p>
              <p className="text-gray-400">
                Pay real money to get absolutely nothing in return.
              </p>
            </div>
            <div className="bg-[#1a102a] p-6 rounded-xl shadow-xl">
              <p className="font-bold text-xl mb-2">3. Brag Online</p>
              <p className="text-gray-400">
                Flex on your friends with your certified stupidity.
              </p>
            </div>
          </div>
        </section>

        {/* Top Meme Products */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl font-semibold mb-4">Top Selling Nothings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#150c22] p-4 rounded-lg">
              <p className="text-white font-bold">Your Dad’s Approval</p>
              <p className="text-gray-500 text-sm">Sold: 1,234</p>
            </div>
            <div className="bg-[#150c22] p-4 rounded-lg">
              <p className="text-white font-bold">Crypto Profits</p>
              <p className="text-gray-500 text-sm">Sold: 2,087</p>
            </div>
            <div className="bg-[#150c22] p-4 rounded-lg">
              <p className="text-white font-bold">The Meaning of Life</p>
              <p className="text-gray-500 text-sm">Sold: 3,611</p>
            </div>
          </div>
        </section>

        {/* Leaderboard Teaser */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Meet the Champions of Nothing
          </h2>
          <p className="text-gray-400 mb-6">
            They spent the most, received the least. True legends.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="bg-[#130a1f] p-6 rounded-xl">
              <p className="text-white font-bold">nothing_simp69</p>
              <p className="text-gray-500 text-sm">53 purchases</p>
            </div>
            <div className="bg-[#130a1f] p-6 rounded-xl">
              <p className="text-white font-bold">val_sold_his_soul</p>
              <p className="text-gray-500 text-sm">39 purchases</p>
            </div>
            <div className="bg-[#130a1f] p-6 rounded-xl">
              <p className="text-white font-bold">yourmomlol</p>
              <p className="text-gray-500 text-sm">34 purchases</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
