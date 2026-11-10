"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bike, ShieldCheck, LogIn, LogOut, ArrowRight, UserCheck, KeyRound, Phone as PhoneIcon, Eye, EyeOff } from "lucide-react";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DeliveryLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState("");
  const [existingUser, setExistingUser] = useState<{ name?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if URL has ?logout=true or ?switch=true
    const urlParams = new URLSearchParams(window.location.search);
    const isLogout = urlParams.get("logout") === "true" || urlParams.get("switch") === "true";

    if (isLogout) {
      localStorage.removeItem("deliveryToken");
      localStorage.removeItem("deliveryUser");
      setExistingUser(null);
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("deliveryToken");
    if (token) {
      let storedUser = null;
      try {
        const raw = localStorage.getItem("deliveryUser");
        if (raw) storedUser = JSON.parse(raw);
      } catch (e) {
        // ignore
      }
      setExistingUser(storedUser || { name: "Delivery Partner" });
    }
    setIsChecking(false);
  }, []);

  const handleLogoutAndSwitch = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryUser");
    setExistingUser(null);
    setPhone("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/delivery-boys/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error?.message || "Invalid phone number or password");
      }

      // Store JWT token & Rider user info
      localStorage.setItem("deliveryToken", data.token);
      if (data.data?.user) {
        localStorage.setItem("deliveryUser", JSON.stringify(data.data.user));
      }

      // Redirect to dashboard
      router.push("/delivery/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your phone and password.");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-500/10 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <span className="text-sm font-semibold text-gray-600">Checking rider session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-orange-100/50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg shadow-orange-500/20 text-white mb-3">
          <Bike size={38} className="stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Tommalu <span className="text-orange-600">Partner</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Rider Fleet & Unified Dispatch App
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Existing Active Session Banner */}
        {existingUser ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-orange-500/5 border border-orange-100 space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0">
                <UserCheck size={22} />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-200 text-emerald-800 rounded-md mb-1">
                  Active Session Detected
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {existingUser.name || "Delivery Partner"}
                </h3>
                {existingUser.phone && (
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    📱 +91 {existingUser.phone}
                  </p>
                )}
                <p className="text-xs text-emerald-800 mt-1.5 font-medium">
                  You are already signed in on this device.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/delivery/dashboard")}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <span>Continue to Rider Dashboard</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleLogoutAndSwitch}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all cursor-pointer"
              >
                <LogOut size={16} className="text-gray-500" />
                <span>Log Out & Switch Rider Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign-in Form */
          <div className="bg-white py-8 px-5 sm:px-10 rounded-3xl shadow-xl shadow-orange-500/5 border border-orange-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Rider Sign In</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered mobile number and password
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs sm:text-sm border border-rose-200 flex items-start gap-2.5">
                <span className="font-bold text-rose-800">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <PhoneIcon size={18} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="block w-full pl-11 pr-3 py-3 text-sm text-gray-900 placeholder-gray-400 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="block w-full pl-11 pr-11 py-3 text-sm text-gray-900 placeholder-gray-400 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Enter your rider password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Authorized Tommalu Rider Portal</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!phone || !password || loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <LogIn size={18} />
                  <span>{loading ? "Signing in..." : "Sign in to Rider Dashboard"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer tip */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Need rider credentials or assignment? Contact Tommalu Dispatch Admin.
        </p>
      </div>
    </div>
  );
}
