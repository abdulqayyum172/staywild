import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../lib/api";

export default function Rent() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${API_URL}/rent/properties?limit=100`);
        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await res.json();
        setProperties(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filtered = properties.filter((prop) => {
    const typeMatch = typeFilter === "All" || prop.type === typeFilter;
    const locationMatch =
      locationFilter === "All" ||
      prop.location.toLowerCase().includes(locationFilter.toLowerCase());
    const searchMatch = prop.title.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && locationMatch && searchMatch;
  });

  // Dynamically extract unique types and locations for filters
  const typeOptions = ["All", ...new Set(properties.map((p) => p.type).filter(Boolean))];
  const locationOptions = ["All", ...new Set(properties.map((p) => {
    const parts = p.location.split(",");
    return parts[parts.length - 1].trim();
  }).filter(Boolean))];

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <section
        className="relative w-full overflow-hidden bg-cover bg-center py-20 text-center text-white shadow-xl"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative z-10 mx-auto max-w-3xl px-5">
          <p className="mb-3 text-sm font-semibold uppercase text-emerald-200">Rental listings</p>
          <h1 className="text-4xl font-bold md:text-6xl">Find a rental that fits the brief.</h1>
          <p className="mt-4 text-base leading-7 text-white/85 md:text-lg">
            Compare verified rental options across Lagos with cleaner filters and direct access after sign in.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Filter rentals</h2>
            <p className="text-sm text-slate-500">
              {loading ? "Loading properties..." : `Showing ${filtered.length} rental options`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by property title..."
            className="h-12 rounded-md border border-slate-300 bg-slate-50 px-4 outline-none"
            disabled={loading}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-12 rounded-md border border-slate-300 bg-slate-50 px-4 outline-none"
            disabled={loading}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-12 rounded-md border border-slate-300 bg-slate-50 px-4 outline-none"
            disabled={loading}
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setTypeFilter("All");
              setLocationFilter("All");
              setSearchQuery("");
            }}
            className="h-12 rounded-md bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800"
            disabled={loading}
          >
            Reset filters
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600 font-semibold">
          Error: {error}
        </div>
      ) : (
        <section className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-0 md:grid-cols-3 animate-fade-in">
          {filtered.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <img src={property.image} alt={property.title} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-950">{property.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{property.location}</p>
                  <p className="mt-3 font-semibold text-emerald-700">
                    {property.priceLabel || `NGN ${new Intl.NumberFormat("en-NG").format(property.price)} / year`}
                  </p>
                  <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700">{property.type}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate("/login", { state: { from: location } });
                    } else {
                      navigate(`/rent/${property.id}`);
                    }
                  }}
                  className={`mt-4 block w-full rounded-md py-2 text-center font-semibold transition ${
                    user ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {user ? "View details" : "Sign in to view"}
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 font-medium">
              No rentals match your filters.
            </div>
          )}
        </section>
      )}
    </main>
  );
}
