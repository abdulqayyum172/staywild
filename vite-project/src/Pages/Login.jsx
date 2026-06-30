import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [loginType, setLoginType] = useState(location.state?.type || "client");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (loginType === "client") {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await adminLogin(email, password);
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setFormError(err.message || `Failed to log in as ${loginType}. Please check your credentials.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.95fr_1.05fr]">
      <section
        className="hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.68)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm font-semibold uppercase text-emerald-200">
            {loginType === "client" ? "StayNest access" : "StayNest administration"}
          </p>
          <h1 className="mt-3 max-w-xl text-5xl font-bold leading-tight">
            {loginType === "client"
              ? "Review saved homes and continue property conversations."
              : "Sign in to control, monitor and authenticate listings."}
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link to="/" className="inline-block text-3xl font-bold tracking-tight text-slate-950">
              Stay<span className="text-emerald-700">Nest</span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-slate-950">
              {loginType === "client" ? "Sign in" : "Admin sign in"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {loginType === "client"
                ? "Access property details, saved listings, and agent contact options."
                : "Enter your administrator credentials to access the backend dashboard."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "client", label: "Client Access" },
              { id: "admin", label: "Admin Portal" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setLoginType(tab.id);
                  setFormError("");
                }}
                className={`h-10 rounded-md text-sm font-semibold transition-all duration-200 ${
                  loginType === tab.id
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {formError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-4 text-slate-950 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-10 text-slate-950 outline-none"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign in</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Do not have an account?{" "}
            <Link
              to="/signup"
              state={{ type: loginType }}
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
