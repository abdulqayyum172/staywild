import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Home, MapPin, Search, ShieldCheck, Users } from "lucide-react";

const searchItems = [
  { name: "Buy", type: "page", link: "/buy" },
  { name: "Rent", type: "page", link: "/rent" },
  { name: "Mortgage", type: "page", link: "/mortgage" },
  { name: "Find an Agent", type: "page", link: "/find-an-agent" },
  { name: "Featured Properties", type: "section", link: "featured-properties" },
  { name: "Gallery", type: "section", link: "gallery" },
  { name: "Blog", type: "section", link: "blog" },
  { name: "Contact", type: "page", link: "Contact" },
];

const Hero = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      const filtered = searchItems.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleNavigation(suggestions[0]);
    } else if (query.trim()) {
      navigate("/buy");
    } else {
      navigate("/buy");
    }
    setQuery("");
    setSuggestions([]);
  };

  const handleNavigation = (item) => {
    if (item.type === "page") {
      navigate(item.link);
    } else if (item.type === "section") {
      const section = document.getElementById(item.link);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
    setQuery("");
    setSuggestions([]);
  };

  return (
    <section
      className="relative min-h-[calc(100svh-115px)] overflow-hidden bg-slate-950"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/65 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-115px)] max-w-7xl flex-col justify-center px-5 py-12 text-white md:px-8 lg:px-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <ShieldCheck size={17} />
            Verified homes, rentals, and local agents
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Move with confidence across Nigeria.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 md:text-xl">
            Search premium homes, compare rentals, and connect with agents who understand the market before you book a viewing.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/buy")}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-700"
            >
              Browse homes
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/find-an-agent")}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Find an agent
              <Users size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative mt-8 max-w-3xl">
            <div className="grid gap-3 rounded-lg border border-white/20 bg-white p-3 shadow-2xl shadow-slate-950/25 sm:grid-cols-[1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Search properties, agents, or sections</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="search"
                  value={query}
                  onChange={handleChange}
                  placeholder="Search buy, rent, agents, gallery..."
                  className="h-12 w-full rounded-md border border-stone-200 bg-stone-50 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 font-bold text-white transition hover:bg-slate-800"
              >
                Search
                <Search size={18} />
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-stone-200 bg-white text-slate-800 shadow-xl">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-emerald-50"
                    onClick={() => handleNavigation(item)}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-sm text-slate-500">{item.type === "section" ? "Section" : "Page"}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <Home className="text-emerald-300" size={22} />
            <p className="mt-3 text-2xl font-bold">120+</p>
            <p className="text-sm text-white/72">Listed homes</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <MapPin className="text-emerald-300" size={22} />
            <p className="mt-3 text-2xl font-bold">8</p>
            <p className="text-sm text-white/72">Prime locations</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <Building2 className="text-emerald-300" size={22} />
            <p className="mt-3 text-2xl font-bold">24h</p>
            <p className="text-sm text-white/72">Agent response</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


