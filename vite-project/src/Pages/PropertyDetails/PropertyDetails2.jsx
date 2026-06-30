import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PropertyDetails2 = () => {
  const property = {
    id: 2,
    title: "Cozy Family Duplex",
    location: "Lekki Phase 1, Lagos",
    price: "$950 / month",
    description:
      "A cozy family duplex perfect for comfort and convenience. Spacious living areas, modern kitchen, and safe neighborhood. Located close to schools, shopping centers, and parks.",
    images: [
      "https://images.unsplash.com/photo-1635108197005-50e733eae3b8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGUlMjBwcm9wZXJ0aWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1627141440602-e9c1e5fd2fbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjE0fHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydGllc3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1625334782492-0fe0a4418c8a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjE5fHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydGllc3xlbnwwfHwwfHx8MA%3D%3D",
    ],
    features: ["4 Bedrooms", "4 Bathrooms", "Private Garden", "Garage", "24/7 Security"],
    agent: {
      name: "Mary Okonkwo",
      phone: "+234 809 876 5432",
      email: "mary.okonkwo@staynest.com",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  };

  const [selectedImage, setSelectedImage] = useState(property.images[0]);

  return (
    <div className="min-h-screen bg-purple-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          to="/"
          className="text-purple-600 font-semibold hover:underline mb-6 inline-block"
        >
          ← Back to Listings
        </Link>

        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{property.title}</h1>
          <p className="text-gray-600 text-lg">{property.location}</p>
          <p className="text-purple-600 text-2xl font-semibold mt-2">{property.price}</p>
        </motion.div>

        <div className="mb-10">
          <motion.img
            key={selectedImage}
            src={selectedImage}
            alt="Selected Property"
            className="w-full h-[500px] object-cover rounded-2xl shadow-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          <div className="flex gap-4">
            {property.images.map((img, index) => (
              <motion.img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-lg shadow-md cursor-pointer border-2 ${
                  selectedImage === img ? "border-purple-600" : "border-transparent"
                }`}
                onClick={() => setSelectedImage(img)}
                whileHover={{ scale: 1.05 }}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Description</h2>
          <p className="text-gray-600 leading-relaxed">{property.description}</p>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
            {property.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-purple-600">✔</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <img
            src={property.agent.photo}
            alt={property.agent.name}
            className="w-24 h-24 rounded-full object-cover shadow-md"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Contact Agent</h3>
            <p className="text-gray-700 font-medium">{property.agent.name}</p>
            <p className="text-gray-600">📞 {property.agent.phone}</p>
            <p className="text-gray-600">📧 {property.agent.email}</p>
            <button className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-600 transition font-medium shadow-md">
              Message Agent
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetails2;


