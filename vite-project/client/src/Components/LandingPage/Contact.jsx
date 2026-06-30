import React, { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { API_URL } from "../../lib/api";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message. Please try again.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <p className="text-sm font-semibold uppercase text-emerald-700">Contact</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            Speak with StayNest client services.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Send a property question, viewing request, or service message. The backend will confirm receipt by email.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_0.8fr] md:px-8">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Thank you. Your message has been submitted successfully.
            </div>
          )}

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-md border border-slate-300 bg-slate-50 px-4 outline-none"
                placeholder="Your name"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-md border border-slate-300 bg-slate-50 px-4 outline-none"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-36 rounded-md border border-slate-300 bg-slate-50 px-4 py-3 outline-none"
                placeholder="How can we help?"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
            {isSubmitting ? "Submitting..." : "Submit message"}
          </button>
        </form>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Office details</h2>
          <div className="mt-6 space-y-5 text-sm text-slate-600">
            <p className="flex gap-3">
              <Mail className="mt-0.5 text-emerald-700" size={18} />
              <span>admin8835@gmail.com</span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 text-emerald-700" size={18} />
              <span>+234 916 311 3401</span>
            </p>
            <p className="flex gap-3">
              <MapPin className="mt-0.5 text-emerald-700" size={18} />
              <span>22 Real Estate Street, Lagos, Nigeria</span>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Contact;
