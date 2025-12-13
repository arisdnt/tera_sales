import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";
import { deleteKv, setKv } from "./kvStore";

export type AuthStatus = "unknown" | "signed_out" | "signed_in";

export type AuthState = {
  status: AuthStatus;
  user: { id: string; email: string | null } | null;
  accessToken?: string;
  expiresAt?: number;
  updatedAt: number;
};

const AUTH_KEY = "auth.state";

export async function startAuthSync(): Promise<() => void> {
  const supabase = getSupabaseClient();

  // Get initial session and ensure it's persisted
  const initial = await supabase.auth.getSession();
  
  console.log('startAuthSync: Initial session:', initial.data.session ? 'found' : 'none');
  await persistSession(initial.data.session);

  // Listen for auth state changes
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    console.log('Auth state changed:', _event, session?.user?.email);
    await persistSession(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  console.log('signOut: Starting logout process');
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  
  console.log('signOut: Supabase signOut completed');
  
  // Delete the auth state entirely so default signed_out state is used
  await deleteKv(AUTH_KEY);
  console.log('signOut: Auth state deleted');
}

async function persistSession(session: Session | null): Promise<void> {
  const next: AuthState = session
    ? {
        status: "signed_in",
        user: { id: session.user.id, email: session.user.email ?? null },
        accessToken: session.access_token,
        expiresAt: session.expires_at,
        updatedAt: Date.now(),
      }
    : {
        status: "signed_out",
        user: null,
        updatedAt: Date.now(),
      };

  console.log('persistSession: Persisting auth state:', next.status, next.user?.email || 'no user');
  await setKv(AUTH_KEY, next);
  console.log('persistSession: Completed');
}

