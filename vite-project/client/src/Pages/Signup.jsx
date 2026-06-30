import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const { signup, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  const isGmailAddress = (value) => {
    const normalized = value.toLowerCase().trim();
    return normalized.endsWith("@gmail.com") || normalized.endsWith("@googlemail.com");
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormNotice("");

    if (!isGmailAddress(email)) {
      setFormError("Please use a Gmail address (@gmail.com) to sign up.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup(name, email, password);

      if (result?.pendingVerification) {
        setPendingEmail(result.email || email);
        setFormNotice(result.message || "Verification code sent. Enter it below to finish signup.");
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err.message || "Failed to create account. Email might already be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormNotice("");

    if (!/^\d{7}$/.test(verificationCode.trim())) {
      setFormError("Please enter the 7-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail(pendingEmail, verificationCode.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setFormError("");
    setFormNotice("");
    setIsVerifying(true);

    try {
      const result = await resendCode(pendingEmail);
      setFormNotice(result.message || "A new verification code has been sent.");
    } catch (err) {
      setFormError(err.message || "Failed to resend code.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.95fr_1.05fr]">
      <section
        className="hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.66), rgba(15, 23, 42, 0.66)), url('https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm font-semibold uppercase text-emerald-200">
            Client account
          </p>
          <h1 className="mt-3 max-w-xl text-5xl font-bold leading-tight">
            Create an account before requesting private property details.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <Link to="/" className="inline-block text-3xl font-bold tracking-tight text-slate-950">
              Stay<span className="text-emerald-700">Nest</span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-slate-950">
              Create account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Use a Gmail address to verify your account and access property details.
            </p>
          </div>

          {formNotice && (
            <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {formNotice}
            </div>
          )}

          {formError && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {pendingEmail ? (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Verification code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={7}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-4 text-slate-950 outline-none"
                    placeholder="7-digit code"
                  />
                </div>
                <p className="text-xs text-slate-500">Code sent to {pendingEmail}</p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <><span>Verify account</span><ArrowRight size={18} /></>}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isVerifying}
                className="h-11 w-full rounded-md border border-slate-300 bg-white font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend code
              </button>
            </form>
          ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-4 text-slate-950 outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Gmail address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-4 text-slate-950 outline-none"
                  placeholder="you@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-10 text-slate-950 outline-none"
                  placeholder="Min 6 characters"
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

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-4 text-slate-950 outline-none"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><span>Create account</span><ArrowRight size={18} /></>}
            </button>
          </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}



