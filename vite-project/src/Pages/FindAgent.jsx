import React, { useState } from "react";
import { Award, Building2, MapPin, MessageCircle, Phone, Search, Star, Users } from "lucide-react";

const agentsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    city: "Lagos",
    specialty: "Renting",
    experience: "3+ years",
    phone: "+2349163113401",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Michael Ade",
    city: "Abuja",
    specialty: "Sales",
    experience: "5+ years",
    phone: "+2349163113402",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Linda Chukwu",
    city: "Port Harcourt",
    specialty: "Land & Rentals",
    experience: "2+ years",
    phone: "+2349163113403",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Ayo Bello",
    city: "Lagos",
    specialty: "Mortgage",
    experience: "4+ years",
    phone: "+2349163113404",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Grace Okoro",
    city: "Abuja",
    specialty: "Luxury Homes",
    experience: "6+ years",
    phone: "+2349163113405",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    name: "Emeka Obi",
    city: "Port Harcourt",
    specialty: "Commercial Properties",
    experience: "5+ years",
    phone: "+2349163113406",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

const FindAgent = ({ propertyName }) => {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");

  const filteredAgents = agentsData.filter((agent) => {
    return (
      agent.name.toLowerCase().includes(search.toLowerCase()) &&
      (city ? agent.city === city : true) &&
      (specialty ? agent.specialty === specialty : true)
    );
  });

  const generateWhatsAppLink = (phone, agentName) => {
    const message = propertyName
      ? `Hello ${agentName}, I am interested in the property "${propertyName}".`
      : `Hello ${agentName}, I am interested in your real estate services.`;

    return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
      message
    )}`;
  };

  const cities = [...new Set(agentsData.map((agent) => agent.city))];
  const specialties = [...new Set(agentsData.map((agent) => agent.specialty))];

  return (
    <main className="min-h-screen bg-[#f7f4ef] pt-24">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-8 lg:px-10">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Users size={16} />
              Verified local specialists
            </span>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Find an agent who knows your next neighborhood.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Compare trusted StayNest agents by city, specialty, and experience, then start a direct conversation when you find the right match.
            </p>
          </div>

          <div className="grid content-end gap-4 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
              <p className="text-3xl font-bold text-slate-950">{agentsData.length}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Active agents</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
              <p className="text-3xl font-bold text-slate-950">{cities.length}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Covered cities</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
              <p className="text-3xl font-bold text-slate-950">4.9</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Average rating</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-10">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search by agent name</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
              <input
                type="text"
                placeholder="Search by agent name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-md border border-stone-200 bg-stone-50 pl-11 pr-4 text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label>
              <span className="sr-only">Filter by city</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-12 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">All Cities</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by specialty</span>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-12 w-full rounded-md border border-stone-200 bg-stone-50 px-4 text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">All Specialties</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCity("");
                setSpecialty("");
              }}
              className="h-12 rounded-md border border-slate-300 px-5 font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Available agents</h2>
            <p className="mt-1 text-sm text-slate-600">
              Showing {filteredAgents.length} of {agentsData.length} agents
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            <Star size={16} className="fill-amber-400 text-amber-500" />
            Top-rated support across Nigeria
          </div>
        </div>

        <div className="grid gap-6 py-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredAgents.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">No agents found</p>
            <p className="mt-2 text-slate-500">Try another city, specialty, or agent name.</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex gap-4 border-b border-stone-100 p-5">
                <img src={agent.img} alt={agent.name} className="h-20 w-20 flex-none rounded-md object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-amber-500" aria-label="5 star rating">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Star key={item} size={14} className="fill-current" />
                    ))}
                  </div>
                  <h3 className="mt-2 truncate text-xl font-bold text-slate-950">{agent.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <MapPin size={15} className="text-emerald-600" />
                    {agent.city}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-stone-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
                      <Building2 size={14} />
                      Specialty
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{agent.specialty}</p>
                  </div>
                  <div className="rounded-md bg-stone-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
                      <Award size={14} />
                      Experience
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{agent.experience}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={generateWhatsAppLink(agent.phone, agent.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex h-11 w-12 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                    aria-label={`Call ${agent.name}`}
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </section>
    </main>
  );
};

export default FindAgent;
