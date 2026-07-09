
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Trusted from "./components/Trusted";
import Everything from "./components/Everything";
import Expanding from "./components/Expanding";
import TradeCassava from "./components/TradeCassava";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Trusted />
      <Everything />
      <Expanding />
      <TradeCassava />
      <HowItWorks />
      <Footer />
    </main>
  );
}

