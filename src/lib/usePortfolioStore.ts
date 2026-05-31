"use client";

import { useEffect, useMemo, useState } from "react";
import { initialPortfolio, type PortfolioData } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/client";
import { fetchUserWorkspace } from "@/app/actions/portfolio";

const portfolioKey = "portfoliohub:data";
const sessionKey = "portfoliohub:session";

function cloneInitialData(): PortfolioData {
  return JSON.parse(JSON.stringify(initialPortfolio)) as PortfolioData;
}

export function usePortfolioStore() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(cloneInitialData);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect if Supabase is configured
  const isSupabase = useMemo(() => {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  // Initialize client if configured
  const supabase = useMemo(() => {
    return isSupabase ? createClient() : null;
  }, [isSupabase]);

  useEffect(() => {
    async function init() {
      if (isSupabase && supabase) {
        setLoading(true);
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            setEmail(user.email ?? null);
            // Fetch real user workspace data from Supabase
            const result = await fetchUserWorkspace();
            if (result && !("error" in result)) {
              setPortfolio(result as PortfolioData);
            }
          }
        } catch (error) {
          console.error("Error initializing Supabase workspace:", error);
        } finally {
          setLoading(false);
          setReady(true);
        }
      } else {
        // Fallback: Local Preview Mode (localStorage)
        const savedPortfolio = window.localStorage.getItem(portfolioKey);
        const savedSession = window.localStorage.getItem(sessionKey);

        if (savedPortfolio) {
          try {
            setPortfolio(JSON.parse(savedPortfolio) as PortfolioData);
          } catch (e) {
            console.error("Failed to parse saved local portfolio:", e);
          }
        }

        if (savedSession) {
          setEmail(savedSession);
        }

        setReady(true);
      }
    }

    init();
  }, [isSupabase, supabase]);

  // Sync to local storage ONLY in local preview mode
  useEffect(() => {
    if (!ready || isSupabase) return;
    window.localStorage.setItem(portfolioKey, JSON.stringify(portfolio));
  }, [portfolio, ready, isSupabase]);

  const auth = useMemo(
    () => ({
      email,
      signIn: async (nextEmail: string) => {
        if (isSupabase && supabase) {
          setLoading(true);
          const { error } = await supabase.auth.signInWithOtp({
            email: nextEmail,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
            },
          });
          setLoading(false);
          if (error) throw error;
          setEmail(nextEmail); // set temporarily during verification step
        } else {
          // Local storage mockup auth
          window.localStorage.setItem(sessionKey, nextEmail);
          setEmail(nextEmail);
        }
      },
      signOut: async () => {
        if (isSupabase && supabase) {
          setLoading(true);
          await supabase.auth.signOut();
          setLoading(false);
        } else {
          window.localStorage.removeItem(sessionKey);
        }
        setEmail(null);
        setPortfolio(cloneInitialData());
      },
    }),
    [email, isSupabase, supabase],
  );

  return {
    portfolio,
    setPortfolio,
    auth,
    ready,
    isSupabase,
    loading,
  };
}
