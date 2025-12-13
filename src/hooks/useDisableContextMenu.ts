import { useEffect } from "react";

export function useDisableContextMenu(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", onContextMenu);
    return () => window.removeEventListener("contextmenu", onContextMenu);
  }, [enabled]);
}

