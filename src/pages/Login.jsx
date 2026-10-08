import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

import BrandMark, { BrandIntro } from "../components/common/BrandMark";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const getPortalDestination = (role) => {
  const normalizedRole = String(role || "").toUpperCase().replace(/^ROLE_/, "");
  const destinations = {
    MAKER: "/",
    CHECKER: "/checker",
    PUBLISHER: "/publisher",
    ADMIN: "/admin",
  };
  return destinations[normalizedRole] || "/login";
};

export default function Login() {
  const { authenticated, user, initiateLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postLoginDestination, setPostLoginDestination] = useState(null);

  useEffect(() => {
    if (!authenticated) return undefined;
    if (!postLoginDestination && loading) return undefined;
    const destination = postLoginDestination || getPortalDestination(user?.role);
    if (!postLoginDestination) {
      navigate(destination, { replace: true });
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      navigate(destination, { replace: true });
    }, 2400);
    return () => window.clearTimeout(timeoutId);
  }, [authenticated, user?.role, postLoginDestination, loading, navigate]);

  if (authenticated && postLoginDestination) return <BrandIntro />;

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const result = await initiateLogin(username.trim(), password, false);
      if (result.success) {
        setPostLoginDestination(getPortalDestination(result.user?.role));
      } else {
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Authentication service error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-radial-[at_50%_0%] from-[#e9f2fb] via-[#f1f6fc] to-[#e4eef9] px-4 py-8 overflow-hidden font-sans">
      {/* Background Decorative Rings & Waves */}
<div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl" />
<div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-indigo-500/25 rounded-full blur-3xl" />
<div className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 bg-[#8A2727]/15 rounded-full blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-5">
<div className="glass inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold tracking-wide text-[#073b7a]">Nishkaiv Solution</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">API PORTAL</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          {/* Header Icon */}
          <div className="flex justify-center mb-4">
            <BrandMark className="h-16 w-auto" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#073b7a]">
              API ONBOARDING
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Enterprise API Onboarding & Management Platform
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold text-rose-600 mt-0.5">!</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. checker@nishkaiv.com or maker@nishkaiv.com"
                  disabled={loading}
className="h-11 w-full rounded-lg border border-white/70 bg-white/50 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
className="h-11 w-full rounded-lg border border-white/70 bg-white/50 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#0877d1] hover:bg-[#0764b3] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
    <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Nishkaiv Solution &bull; Version 1.1 (2026)
        </p>
      </div>
    </div>
  );
}