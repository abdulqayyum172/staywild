import React from "react";

const LuxuryPropertyGuide = () => {
  return (
    <section className="py-24 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Luxury Properties: What to Look For
      </h1>

      <p className="text-gray-500 mb-6">Published: Sep 15, 2025</p>

      <img
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        alt="Luxury Property"
        className="w-full rounded-xl mb-8"
      />

      <p className="text-gray-700 leading-relaxed">
        Luxury real estate offers unique value and lifestyle benefits. Here’s
        what truly matters when evaluating a high-end property...
      </p>
    </section>
  );
};

export default LuxuryPropertyGuide;

