import React, { useState } from "react";
import { Phone, Mail, X } from "lucide-react";

const Agents = () => {
  const agents = [
    {
      name: "John Adewale",
      role: "Senior Property Consultant",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      phone: "+234 812 345 6789",
      email: "john.adewale@staynest.com",
    },
    {
      name: "Amaka Eze",
      role: "Real Estate Agent",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      phone: "+234 809 112 3344",
      email: "amaka.eze@staynest.com",
    },
    {
      name: "Michael Yusuf",
      role: "Luxury Property Specialist",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      phone: "+234 802 567 9911",
      email: "michael.yusuf@staynest.com",
    },
    {
      name: "Kemi Ogunleye",
      role: "Client Relations Manager",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      phone: "+234 803 998 2211",
      email: "kemi.ogunleye@staynest.com",
    },
  ];

  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <section className="bg-purple-50 py-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
          Meet Our <span className="text-purple-600">Agents</span>
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Our trusted agents are ready to help you buy, rent, or sell your next property.
          Browse and contact an agent that fits your needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {agents.map((agent) => (
            <div
              key={agent.email}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >
              <div className="relative w-full h-56 overflow-hidden rounded-lg">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center mt-4">
                <h3 className="text-xl font-bold text-gray-800">{agent.name}</h3>
                <p className="text-purple-600 font-medium mb-4">{agent.role}</p>

                <div className="text-gray-600 text-sm space-y-2">
                  <p className="flex justify-center items-center gap-2">
                    <Phone size={16} className="text-purple-600" /> {agent.phone}
                  </p>
                  <p className="flex justify-center items-center gap-2">
                    <Mail size={16} className="text-purple-600" /> {agent.email}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="mt-5 cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition"
                >
                  Contact Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">

            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedAgent(null)}
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <img
                src={selectedAgent.image}
                alt={selectedAgent.name}
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h3 className="text-xl font-bold">{selectedAgent.name}</h3>
              <p className="text-purple-600">{selectedAgent.role}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Message sent to ${selectedAgent.name}!`);
                setSelectedAgent(null);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Your Name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />

              <input
                type="email"
                placeholder="Your Email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />

              <textarea
                placeholder="Your Message"
                required
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              ></textarea>

              <button
                type="submit"
                className="w-full cursor-pointer bg-purple-600 hover:bg-purple-600 text-white py-3 rounded-full"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Agents;


