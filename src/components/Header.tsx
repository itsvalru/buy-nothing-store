"use client";

import { useEffect, useState } from "react";
import HeaderContent from "./HeaderContent"; // Split logic into a clean component

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <HeaderContent />;
}
