"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
  total_spent?: number;
  created_at?: string;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("id, email, avatar_url, display_name")
          .eq("id", session.user.id)
          .single();

        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          getUser();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
