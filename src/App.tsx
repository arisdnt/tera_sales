import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { SystemToolbar } from "./components/layout/SystemToolbar";
import { createOutboxWorker } from "./services/outboxWorker";
import { useRealtimeSync } from "./hooks/useRealtimeSync";
import { SalesPage } from "./features/sales/SalesPage";
import { LoginPage } from "./features/auth/LoginPage";
import { PembayaranPage } from "./features/payments/PembayaranPage";
import { startAuthSync, signOut } from "./services/authService";
import { useAuthState } from "./hooks/useAuthState";
import { useDisableContextMenu } from "./hooks/useDisableContextMenu";

type TabKey = string;

const TAB_TO_PATH: Record<string, string> = {
  dashboard: "/dashboard",
  pembayaran: "/pembayaran",
  sales: "/sales",
};

function pathToTab(pathname: string): TabKey {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const entry = Object.entries(TAB_TO_PATH).find(([, path]) => path === clean);
  return entry ? entry[0] : "dashboard";
}

export function App() {
  const auth = useAuthState();
  const isSignedIn = auth.status === "signed_in";
  useDisableContextMenu(true);

  console.log('App: Current auth state:', auth.status, 'user:', auth.user?.email || 'none', 'isSignedIn:', isSignedIn);

  useRealtimeSync({ enabled: isSignedIn, initialSync: true });

  const worker = useMemo(() => createOutboxWorker(), []);
  useEffect(() => {
    if (!isSignedIn) {
      worker.stop();
      return;
    }
    worker.start();
    return () => worker.stop();
  }, [isSignedIn, worker]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    void (async () => {
      unsub = await startAuthSync();
    })();
    return () => unsub?.();
  }, []);

  const [tab, setTabState] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "dashboard";
    return pathToTab(window.location.pathname);
  });

  const setTab = useCallback((next: TabKey) => {
    setTabState(next);
  }, []);

  useEffect(() => {
    const path = TAB_TO_PATH[tab] ?? "/dashboard";
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.replaceState({}, "", path);
    }
  }, [tab]);

  useEffect(() => {
    const onPopState = () => {
      setTabState(pathToTab(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {isSignedIn && (
        <Navbar
          title="Tera Sales"
          tab={tab}
          onChangeTab={setTab}
          showNav={isSignedIn}
          rightSlot={isSignedIn ? <AuthRight email={auth.user?.email ?? null} /> : null}
        />
      )}
      <main className="flex-1 overflow-hidden">
        {auth.status === "unknown" ? (
          <Splash />
        ) : isSignedIn ? (
          tab === "pembayaran" ? (
            <PembayaranPage />
          ) : tab === "sales" ? (
            <SalesPage />
          ) : (
            <Placeholder title={tab} />
          )
        ) : (
          <LoginPage />
        )}
      </main>
      {isSignedIn ? <SystemToolbar /> : null}
    </div>
  );
}

function AuthRight({ email }: { email: string | null }) {
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      console.log('AuthRight: Starting logout...');
      await signOut();
      console.log('AuthRight: Logout completed');
    } catch (error) {
      console.error('AuthRight: Logout failed:', error);
    } finally {
      setBusy(false);
    }
  }

  // Get initials from email
  const initials = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-2.5">
      {/* User Avatar & Email */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
          {initials}
        </div>
        <div className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-600" title={email ?? ""}>
          {email ?? "Signed in"}
        </div>
      </div>

      {/* Logout Button */}
      <button
        className="h-7 px-3 bg-slate-100 text-xs font-semibold text-slate-700
                 hover:bg-slate-200 active:scale-[0.98]
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-150
                 flex items-center gap-1.5"
        type="button"
        onClick={onLogout}
        disabled={busy}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{busy ? "..." : "Logout"}</span>
      </button>
    </div>
  );
}

function Splash() {
  return (
    <section className="w-full px-5 py-4">
      <div className="text-sm font-bold text-black">Loading…</div>
      <div className="mt-1 text-xs text-black/60">Mengecek sesi login.</div>
    </section>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="w-full px-5 py-4">
      <div className="text-sm font-bold text-black">{title}</div>
      <div className="mt-1 text-xs text-black/60">Belum di-wire di contoh ini.</div>
    </section>
  );
}
