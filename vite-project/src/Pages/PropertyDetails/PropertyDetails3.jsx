import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PropertyDetails3 = () => {
  const property = {
    id: 3,
    title: "Stylish Studio Apartment",
    location: "Ikeja GRA, Lagos",
    price: "$700 / month",
    description:
      "This stylish studio apartment offers a cozy yet modern living experience. Perfect for singles or young professionals, it’s located in Ikeja GRA with easy access to transport, cafes, and nightlife.",
    images: [
      "https://images.unsplash.com/photo-1635108195644-a3c57f263186?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fHJlYWwlMjBlc3RhdGUlMjBwcm9wZXJ0aWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1651766231263-334093e2de45?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjIzfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydGllc3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1651765881075-193cf4ad62ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjMyfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydGllc3xlbnwwfHwwfHx8MA%3D%3D",
    ],
    features: ["1 Bedroom", "1 Bathroom", "Fully Furnished", "24/7 Security", "Air Conditioning"],
    agent: {
      name: "Tunde Alabi",
      phone: "+234 816 888 9900",
      email: "tunde.alabi@stayfinder.com",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {property.title}
          </h1>
          <p className="text-gray-600 text-lg">{property.location}</p>
          <p className="text-purple-600 text-2xl font-semibold mt-2">
            {property.price}
          </p>
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Property Description
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {property.description}
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Features
          </h2>
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
            <h3 className="text-xl font-semibold text-gray-800">
              Contact Agent
            </h3>
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

export default PropertyDetails3;


