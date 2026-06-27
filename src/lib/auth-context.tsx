import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  bio: string | null;
  verified: boolean;
  username_changed: boolean;
  created_at: string;
};

type PendingAction = (() => void | Promise<void>) | null;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  modalOpen: boolean;
  openLogin: (pending?: PendingAction) => void;
  closeLogin: () => void;
  signOut: () => Promise<void>;
  requireAuth: (action: () => void | Promise<void>) => boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingRef = useRef<PendingAction>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      if (data.session?.user?.id) loadProfile(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess?.user?.id) {
        // defer to avoid deadlocks inside auth callback
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
      if (event === "SIGNED_IN") {
        setModalOpen(false);
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending) setTimeout(() => { void pending(); }, 50);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const openLogin = useCallback((pending?: PendingAction) => {
    if (pending) pendingRef.current = pending;
    setModalOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    pendingRef.current = null;
    setModalOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const requireAuth = useCallback(
    (action: () => void | Promise<void>) => {
      if (session?.user) {
        void action();
        return true;
      }
      openLogin(action);
      return false;
    },
    [session, openLogin],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      modalOpen,
      openLogin,
      closeLogin,
      signOut,
      requireAuth,
      refreshProfile,
    }),
    [session, profile, loading, modalOpen, openLogin, closeLogin, signOut, requireAuth, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
