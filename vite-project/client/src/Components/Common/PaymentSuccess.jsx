import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-emerald-700" size={54} />
        <h1 className="mt-5 text-3xl font-bold text-slate-950">Payment successful</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Thank you. Your payment has been processed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 font-semibold text-white transition hover:bg-emerald-800"
        >
          Go back home
        </Link>
      </section>
    </main>
  );
}
