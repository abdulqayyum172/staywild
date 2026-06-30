import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send, Mail, Phone, MapPin, Award, CheckCircle } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe. Please try again.");
      }

      setStatus({ type: "success", message: "Successfully subscribed! Check your email." });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const discoverLinks = [
    { name: "Rent Properties", path: "/Rent" },
    { name: "Buy Properties", path: "/Buy" },
    { name: "Mortgage Calculator", path: "/Mortgage" },
  ];

  const companyLinks = [
    { name: "Find an Agent", path: "/find-an-agent" },
    { name: "Contact Support", path: "/Contact" },
    { name: "Tips & Blog", path: "/blog/home-buying-tips" },
    { name: "Admin Portal", path: "/admin" },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, url: "https://facebook.com" },
    { icon: <Twitter size={18} />, url: "https://twitter.com" },
    { icon: <Instagram size={18} />, url: "https://instagram.com" },
    { icon: <Linkedin size={18} />, url: "https://linkedin.com" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-[#101820] pt-16 pb-10 font-sans text-slate-300">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand & Description Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-white">
                Stay<span className="text-emerald-400">Nest</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              StayNest is Nigeria's premium real estate platform. We connect clients to authenticated properties, reliable agents, and simplified financial services.
            </p>
            {/* Verification Tag */}
            <div className="flex w-fit items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Award size={14} />
              <span>100% Verified Listings</span>
            </div>
          </div>

          {/* Discover Links */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Discover</h3>
            <ul className="space-y-3">
              {discoverLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm transition-colors duration-200 hover:text-emerald-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm transition-colors duration-200 hover:text-emerald-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Stay Updated</h3>
            <p className="text-sm leading-relaxed">
              Subscribe to get latest property lists, tips, and market insights.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1 rounded-md bg-emerald-600 p-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>

              {status.message && (
                <p className={`text-xs mt-1 ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Contacts info */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs">
            <a href="mailto:ayinlove172@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={14} className="text-emerald-400" />
              <span>ayinlove172@gmail.com</span>
            </a>
            <a href="tel:+2349163113401" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={14} className="text-emerald-400" />
              <span>+234 916 311 3401</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" />
              <span>Lagos, Nigeria</span>
            </span>
          </div>

          {/* Social Media Links & Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-white/5 bg-white/5 p-2.5 text-slate-400 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} StayNest. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
