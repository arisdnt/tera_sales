import { useEffect, useMemo, useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { Copy, Check } from "lucide-react";

export function SystemToolbar() {
  const pendingOutbox = useLiveQuery(
    () => db.outbox.where("status").equals("pending").count(),
    [],
    0,
  );

  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [now, setNow] = useState(() => new Date());
  const [currentPath, setCurrentPath] = useState(() => typeof window !== "undefined" ? window.location.pathname : "/");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Listen for path changes
  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);

    // Also check periodically for SPA navigation
    const pathCheckInterval = setInterval(updatePath, 500);

    return () => {
      window.removeEventListener("popstate", updatePath);
      clearInterval(pathCheckInterval);
    };
  }, []);

  const handleCopyPath = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy path:", err);
    }
  }, [currentPath]);

  const timeText = useMemo(() => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), [now]);
  const dateText = useMemo(() => now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" }), [now]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-5 bg-gray-100/90 backdrop-blur-xl border-t border-gray-200/30 shadow-md">
      <div className="h-full w-full flex items-center justify-between px-4 text-[10px] font-semibold">
        {/* Left Section - Status */}
        <div className="flex items-center gap-4">
          {/* Network Status */}
          <div className="flex items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`${isOnline ? "text-gray-600" : "text-gray-600"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Outbox Status */}
          <div className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-gray-500">Outbox</span>
            <span className={pendingOutbox > 0 ? "text-amber-600 font-bold" : "text-gray-400 font-bold"}>
              {pendingOutbox}
            </span>
          </div>

          {/* Current Path with Copy */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Path:</span>
            <span className="text-teal-600 font-mono">{currentPath}</span>
            <button
              onClick={handleCopyPath}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
              title="Copy path"
            >
              {copied ? (
                <Check size={10} className="text-green-500" />
              ) : (
                <Copy size={10} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Right Section - Date & Time */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">{dateText}</span>
          <span className="text-gray-700 font-mono font-bold">{timeText}</span>
        </div>
      </div>
    </footer>
  );
}

