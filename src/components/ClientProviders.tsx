"use client";

import { UserProvider } from "@/context/UserContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
