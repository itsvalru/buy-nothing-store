"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session?.user) {
      const { data: userProfile } = await supabase
        .from("users")
        .select("id, email, avatar_url, display_name")
        .eq("id", sessionData.session.user.id)
        .single();

      if (userProfile) setUser(userProfile);
      else setUser(null);
    } else {
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
