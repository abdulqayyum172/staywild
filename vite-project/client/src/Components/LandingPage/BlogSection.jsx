import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const blogs = [
    {
      title: "5 Tips to Buy Your First Home",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      date: "Nov 1, 2025",
      link: "/blog/home-buying-tips",
    },
    {
      title: "How to Invest in Real Estate in 2025",
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      date: "Oct 20, 2025",
      link: "/blog/real-estate-investing",
    },
    {
      title: "Luxury Properties: What to Look For",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      date: "Sep 15, 2025",
      link: "/blog/luxury-property-guide",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">

        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Real Estate <span className="text-purple-600">Tips & Insights</span>
        </h2>

        <p className="text-gray-600 mb-12">
          Stay informed with our expert advice and guides to help you make smart
          property decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <Link to={blog.link}>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />

                <div className="p-6 text-left">
                  <p className="text-gray-400 text-sm mb-2">{blog.date}</p>

                  <h3 className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 mt-2">Read more →</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;


