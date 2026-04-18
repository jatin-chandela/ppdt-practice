import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase.js';

const AuthCtx = createContext({ user: null, loading: true, isAnonymous: true, signOut: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous sign-in failed:', error.message);
        } else {
          setUser(data.user);
        }
      }
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
    const { data } = (await supabase?.auth.signInAnonymously()) || {};
    setUser(data?.user ?? null);
  };

  const isAnonymous = !!user?.is_anonymous;

  return (
    <AuthCtx.Provider value={{ user, loading, isAnonymous, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
