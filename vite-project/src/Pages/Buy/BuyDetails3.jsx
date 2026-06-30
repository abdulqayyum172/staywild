import React from "react";
import { useNavigate } from "react-router-dom";

export default function BuyDetails3() {
  const navigate = useNavigate();

  const property = {
    id: 3,
    title: "Marble Crest Mansion",
    location: "Lekki Phase 1, Lagos",
    priceLabel: "₦35,000,000",
    amount: 35000000,
    type: "Luxury Mansion",
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600607687940-4ad236f699ca?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154542-630846df5648?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80",
    ],
    description:
      "An extravagant 6-bedroom mansion featuring Italian marble interiors, automated lighting, a private rooftop lounge, and dual living rooms. A masterpiece built for ultra-modern taste.",
    features: [
      "6 Bedrooms",
      "2 Living Rooms",
      "Private Rooftop Lounge",
      "Smart Lighting System",
      "Chef’s Kitchen",
      "Indoor Bar",
      "Home Office",
      "24/7 Security",
    ],
    agent: {
      name: "Femi Adesina",
      phone: "2349163113401",
      email: "femi@stayfinder.com",
    },
  };

  const contactAgent = () => {
    const msg = `Hello ${property.agent.name}, I'm interested in ${property.title} in ${property.location}. Please provide more details.`;
    window.open(`https://wa.me/${property.agent.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const buyNow = () => {
    if (!window.PaystackPop) {
      alert("Paystack not loaded!");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: "pk_live_750dc2d1ba53e2718c08b9e24d14cf3732ae8be7",
      email: "buyer@example.com",
      amount: property.amount * 100,
      currency: "NGN",
      ref: "SALE3-" + Date.now(),
      callback: function () {
        alert("Payment successful — thank you!");
        navigate("/payment-success");
      },
      onClose: function () {
        alert("Payment closed.");
      },
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-purple-50 pb-20">
      <div className="relative h-[350px] md:h-[420px] w-full overflow-hidden">
        <img
          src={property.hero}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

        <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {property.title}
          </h1>
          <p className="text-sm md:text-lg opacity-90">
            {property.location} • {property.type}
          </p>
          <p className="mt-3 text-xl md:text-2xl font-semibold text-purple-600">
            {property.priceLabel}
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {property.gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="w-full h-36 md:h-40 rounded-lg object-cover"
                />
              ))}
            </div>

            <section>
              <h2 className="text-2xl font-semibold">Overview</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Property Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-gray-700">
                {property.features.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="p-4 bg-white rounded-xl flex flex-col gap-4 border">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1">
                {property.priceLabel}
              </p>
            </div>

            <button
              onClick={buyNow}
              className="w-full bg-purple-600 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold"
            >
              Buy Now
            </button>

            <button
              onClick={contactAgent}
              className="w-full bg-white border border-purple-600 text-purple-600 py-3 rounded-lg font-semibold"
            >
              Contact Agent
            </button>

            <div className="mt-2 p-4 bg-white rounded-lg border">
              <h4 className="font-semibold">Agent</h4>
              <p className="text-gray-700">{property.agent.name}</p>
              <p className="text-sm text-gray-500">{property.agent.phone}</p>
              <p className="text-sm text-gray-500">{property.agent.email}</p>
            </div>

            <p className="text-xs text-gray-400 mt-auto">
              Secure payments via Paystack.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}


