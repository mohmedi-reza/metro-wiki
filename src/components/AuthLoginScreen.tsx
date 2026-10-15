import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound
} from "lucide-react";

interface AuthLoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

// Convert Persian and Arabic numbers to standard English ASCII numbers
export function normalizeNumbers(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let result = str.trim();
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persianDigits[i], String(i));
    result = result.replaceAll(arabicDigits[i], String(i));
  }
  return result;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normUser = normalizeNumbers(username);
    const normPass = normalizeNumbers(password);

    if (!normUser || !normPass) {
      setError("لطفاً نام کاربری و رمز ورود را وارد کنید.");
      return;
    }

    setIsLoading(true);

    // Authentication check for username: 1590, password: 0159
    setTimeout(() => {
      if (normUser === "1590" && normPass === "0159") {
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(normUser);
        }, 500);
      } else {
        setIsLoading(false);
        setError("نام کاربری یا رمز ورود نادرست است. لطفاً مجدداً تلاش کنید.");
      }
    }, 400);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen min-h-dvh w-full bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-white selection:text-black font-sans relative overflow-x-hidden overflow-y-auto"
    >
      {/* Background ambient lighting and subtle micro-grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800/25 via-neutral-950/80 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Decorative subtle glow orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Minimal Top Header - No domain/site details */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-md">
            <KeyRound className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">
              سامانه احراز هویت
            </span>
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
              SECURE PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium hidden sm:inline text-neutral-400">
            ارتباط امن (SSL)
          </span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-800/90 border border-neutral-700/60 text-white shadow-inner mb-2">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ورود به حساب کاربری
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              لطفاً نام کاربری و رمز عبور خود را جهت دسترسی به پرتال وارد نمایید.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5 transition-all">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-username"
                className="block text-xs font-semibold text-neutral-300"
              >
                نام کاربری:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-username"
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری را وارد کنید"
                  autoComplete="username"
                  autoFocus
                  required
                  className="w-full bg-neutral-950/70 border border-neutral-800 focus:border-white focus:ring-1 focus:ring-white rounded-xl py-2.5 ps-10 pe-3 text-sm text-white placeholder:text-neutral-500 outline-none font-mono tracking-wider transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-neutral-300"
              >
                رمز ورود:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-neutral-950/70 border border-neutral-800 focus:border-white focus:ring-1 focus:ring-white rounded-xl py-2.5 ps-10 pe-10 text-sm text-white placeholder:text-neutral-500 outline-none font-mono tracking-wider transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                />
                <span className="text-[12px] text-neutral-300">مرا به خاطر بسپار</span>
              </label>

              <span className="text-[11px] text-neutral-500">
                احراز هویت رمزنگاری‌شده
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تأیید هویت موفق... ورود</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <>
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Minimal security reassurance footnote */}
          <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-center gap-2 text-center text-[11px] text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>سامانه امن احراز هویت یکپارچه</span>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-neutral-600 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>© کلیه حقوق محفوظ است.</span>
          <span>درگاه ورود امن کاربران</span>
        </div>
      </footer>
    </div>
  );
};
