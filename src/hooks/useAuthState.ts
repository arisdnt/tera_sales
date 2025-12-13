import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/schema";
import type { AuthState } from "../services/authService";

const AUTH_KEY = "auth.state";

export function useAuthState(): AuthState {
  // Query all KV entries to ensure we detect changes
  const allKv = useLiveQuery(
    () => db.kv.toArray(),
    []
  );
  
  // Find the auth state from all entries
  const authEntry = allKv?.find(entry => entry.key === AUTH_KEY);
  
  if (authEntry?.value) {
    const state = authEntry.value as AuthState;
    console.log('useAuthState: Auth state from DB:', state.status, state.user?.email || 'no user');
    return state;
  }
  
  console.log('useAuthState: No auth state found, defaulting to signed_out');
  return { status: "signed_out", user: null, updatedAt: Date.now() };
}

