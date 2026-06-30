import React from "react";

export default function RentDetails7() {
  const property = {
    id: 7,
    title: "Modern Mini Flat with Balcony",
    location: "Lekki Phase 2",
    price: "₦750,000 / year",
    amount: 750000,
    type: "Mini Flat",
    image: "https://images.unsplash.com/photo-1512918766674-ed62b9a39c52?auto=format&fit=crop&w=1200&q=80",
    description:
      "A contemporary mini flat with a balcony in Lekki Phase 2. Perfect for young professionals who love modern living with scenic views.",
    features: [
      "2 Bedrooms",
      "2 Toilets",
      "Fitted Kitchen",
      "Balcony",
      "Wardrobes Installed",
      "24/7 Security",
      "Nearby Shopping Centers",
      "Modern Lighting",
    ],
  };

  const contactAgent = () => {
    const phone = "2349163113401";
    const message = `Hello, I'm interested in the property: ${property.title} located at ${property.location}. Please share more details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const payWithPaystack = () => {
    const handler = window.PaystackPop.setup({
      key: "pk_live_750dc2d1ba53e2718c08b9e24d14cf3732ae8be7",
      email: "user@example.com",
      amount: property.amount * 100,
      currency: "NGN",
      ref: "REF-" + Date.now(),
      callback: function () {
        alert("Payment successful!");
        window.location.href = "/payment-success";
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });
    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-purple-50 pb-20">
      <div className="w-full h-64">
        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
      </div>
      <div className="max-w-5xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <p className="text-gray-600 mt-1">{property.location}</p>
        <p className="text-purple-600 font-bold text-2xl mt-4">{property.price}</p>
        <span className="inline-block mt-3 bg-gray-200 px-3 py-1 rounded-lg text-sm text-gray-700">{property.type}</span>

        <h2 className="text-xl font-semibold mt-8">Property Description</h2>
        <p className="text-gray-700 mt-2 leading-relaxed">{property.description}</p>

        <h2 className="text-xl font-semibold mt-8">Key Features</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {property.features.map((item, index) => (
            <li key={index} className="text-gray-700 flex items-center">• {item}</li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button onClick={contactAgent} className="w-full sm:w-1/2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition">Contact Agent</button>
          <button onClick={payWithPaystack} className="w-full sm:w-1/2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition">Proceed to Payment</button>
        </div>
      </div>
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </div>
  );
}


