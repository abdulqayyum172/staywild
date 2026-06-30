import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../lib/api";

export default function BuyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_URL}/buy/properties/${id}`);
        if (!res.ok) {
          throw new Error("Property not found or connection error");
        }
        const data = await res.json();
        setProperty(data.property);
        if (data.property) {
          if (data.property.gallery && data.property.gallery.length > 0) {
            setSelectedImage(data.property.gallery[0]);
          } else {
            setSelectedImage(data.property.image || data.property.hero || "");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-semibold">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50 px-6">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error || "Property not found"}</p>
          <Link to="/buy" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition">
            Back to Purchase Listings
          </Link>
        </div>
      </div>
    );
  }

  const contactAgent = () => {
    const msg = `Hello ${property.agent?.name || "Agent"}, I'm interested in ${property.title} located at ${property.location}. Kindly provide more details.`;
    window.open(
      `https://wa.me/${property.agent?.phone || "2349163113401"}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const buyNow = () => {
    if (!window.PaystackPop) {
      alert("Paystack script not loaded. Check your index.html file.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: "pk_live_750dc2d1ba53e2718c08b9e24d14cf3732ae8be7",
      email: user?.email || "buyer@example.com",
      amount: (property.price || property.amount || 0) * 100,
      currency: "NGN",
      ref: "SALEA-" + Date.now(),
      callback: function () {
        alert("Payment successful!");
        window.location.href = "/payment-success";
      },
      onClose: function () {
        alert("Payment popup closed.");
      },
    });

    handler.openIframe();
  };

  const galleryImages = property.gallery && property.gallery.length > 0
    ? property.gallery
    : [property.image || property.hero].filter(Boolean);

  return (
    <div className="min-h-screen bg-purple-50 pb-20">
      <div className="relative h-[350px] md:h-[420px] w-full overflow-hidden">
        <img
          src={property.hero || property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white drop-shadow-lg pr-6">
          <Link to="/buy" className="text-emerald-300 font-semibold hover:underline mb-2 inline-block">
            ← Back to Listings
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">{property.title}</h1>
          <p className="text-sm md:text-lg opacity-90">
            {property.location} • {property.type}
          </p>
          <p className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
            {property.priceLabel || `NGN ${new Intl.NumberFormat("en-NG").format(property.price)}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {galleryImages.length > 0 && (
              <div className="space-y-4">
                <img
                  src={selectedImage || galleryImages[0]}
                  alt="Property Visual"
                  className="w-full h-80 md:h-[400px] object-cover rounded-xl shadow-md"
                />
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {galleryImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Gallery ${i}`}
                        className={`w-24 h-24 rounded-lg object-cover cursor-pointer border-2 transition ${
                          selectedImage === src ? "border-purple-600 scale-95" : "border-transparent opacity-85 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedImage(src)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <section className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-slate-800">Overview</h2>
              <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {property.features && property.features.length > 0 && (
              <section className="border-t pt-6">
                <h3 className="text-xl font-semibold text-slate-800">Property Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-slate-600">
                  {property.features.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="p-5 bg-slate-50 rounded-xl flex flex-col gap-4 border h-fit sticky top-24">
            <div>
              <p className="text-sm text-slate-500 font-semibold">PRICE</p>
              <p className="text-2xl md:text-3xl font-extrabold text-purple-700 mt-1">
                {property.priceLabel || `NGN ${new Intl.NumberFormat("en-NG").format(property.price)}`}
              </p>
            </div>

            <button
              onClick={buyNow}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition shadow-sm"
            >
              Buy Now
            </button>

            <button
              onClick={contactAgent}
              className="w-full bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-lg font-bold transition"
            >
              Contact Agent
            </button>

            {property.agent && (
              <div className="mt-2 p-4 bg-white rounded-lg border">
                <h4 className="font-bold text-slate-800 border-b pb-2 mb-2">Assigned Agent</h4>
                <p className="text-slate-700 font-semibold text-sm">{property.agent.name || "StayNest Admin"}</p>
                <p className="text-xs text-slate-500 mt-1">📞 {property.agent.phone}</p>
                {property.agent.email && <p className="text-xs text-slate-500 mt-0.5">✉ {property.agent.email}</p>}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mt-2">
              Secure payments powered by Paystack.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
