import { useState } from "react";
import { signInWithPassword } from "../../services/authService";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const e1 = email.trim();
    if (!e1) return setError("Email wajib diisi.");
    if (!password) return setError("Password wajib diisi.");

    setBusy(true);
    try {
      await signInWithPassword(e1, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full w-full relative" data-tauri-drag-region>
      {/* Window Close Control - Top Right */}
      <div className="absolute top-0 right-0 z-50 flex border border-slate-200" data-tauri-drag-region="false">
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-red-600 bg-white text-red-500 hover:text-white transition-colors"
          onClick={() => getCurrentWindow().close()}
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Left Panel - Image Only (80%) */}
      <div
        className="hidden lg:block lg:w-4/5 relative overflow-hidden bg-slate-900"
        data-tauri-drag-region
      >
        <img
          src="/login-illustration.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
        />
      </div>

      {/* Right Panel - Login Form (20%) */}
      <div className="w-full lg:w-1/5 flex items-center justify-center bg-white px-6 py-12" data-tauri-drag-region>
        <div className="w-full max-w-sm" data-tauri-drag-region="false">
          {/* Login Card */}
          <div className="bg-white">
            {/* Form */}
            <form className="space-y-5" onSubmit={onSubmit} autoComplete="off">
              {/* Email Field */}
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="Email"
                  className="w-full h-11 px-4 border-2 border-slate-200 bg-slate-50 text-slate-900 
                           placeholder:text-slate-400 text-sm font-medium
                           focus:border-slate-900 focus:bg-white focus:outline-none
                           transition-all duration-200"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="Password"
                    className="w-full h-11 px-4 pr-11 border-2 border-slate-200 bg-slate-50 text-slate-900 
                             placeholder:text-slate-400 text-sm font-medium
                             focus:border-slate-900 focus:bg-white focus:outline-none
                             transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 
                             hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border-l-4 border-red-500">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-red-700">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 bg-slate-900 text-white font-semibold text-sm tracking-wide
                         border-2 border-slate-900
                         hover:bg-slate-800 hover:border-slate-800
                         active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900
                         transition-all duration-200
                         flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
