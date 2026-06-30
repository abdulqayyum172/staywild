import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/LandingPage/Navbar";
import Hero from "./Components/LandingPage/Hero";
import FeaturedProperties from "./Pages/PropertyDetails/FeaturedProperties";
import PropertyDetails from "./Pages/PropertyDetails/PropertyDetails";
import PropertyDetails2 from "./Pages/PropertyDetails/PropertyDetails2";
import PropertyDetails3 from "./Pages/PropertyDetails/PropertyDetails3";
import WhyChooseUs from "./Components/LandingPage/WhyChooseUS";
import Agents from "./Components/LandingPage/Agents";
import Footer from "./Components/LandingPage/Footer";
import BlogSection from "./Components/LandingPage/BlogSection";
import Gallery from "./Components/LandingPage/Gallery";
import Rent from "./Pages/Rent/Rent";
import Buy from "./Pages/Buy/Buy";
import Mortgage from "./Pages/Mortgage";
import FindAgent from "./Pages/FindAgent";
import RentDetails from "./Pages/Rent/RentDetails";
import PaymentSuccess from "./Components/Common/PaymentSuccess";
import BuyDetails from "./Pages/Buy/BuyDetails";
import HomeBuyingTips from "./Components/LandingPage/HomeBuyingTips";
import RealEstateInvesting from "./Components/LandingPage/RealEstateInvesting";
import LuxuryPropertyGuide from "./Components/LandingPage/LuxuryPropertyGuide";
import Contact from "./Components/LandingPage/Contact";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Admin from "./Pages/Admin";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <FeaturedProperties />
              <Gallery />
              <WhyChooseUs />
              <Agents />
              <BlogSection />
              
            </>
          }
        />
        <Route path="/property/1" element={<PropertyDetails />} />
        <Route path="/property/2" element={<PropertyDetails2 />} />
        <Route path="/property/3" element={<PropertyDetails3 />} />
        <Route path="/agent/:id" element={<Agents />} />
        <Route path="/Rent" element={<Rent/>} />
        <Route path="/Buy" element={<Buy/>} />
        <Route path="/Mortgage" element={<Mortgage/>} />
        <Route path="/find-an-agent" element={<FindAgent />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/rent/:id" element={<RentDetails />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/buy/:id" element={<BuyDetails />} />
        <Route path="/blog/home-buying-tips" element={<HomeBuyingTips />} />
        <Route path="/blog/real-estate-investing" element={<RealEstateInvesting />} />
        <Route path="/blog/luxury-property-guide" element={<LuxuryPropertyGuide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />

      </Routes>
      <Footer />
      
    </>
  );
};

export default App;
