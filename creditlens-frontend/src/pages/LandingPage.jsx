import AnnouncementBar from "../components/landing/AnnouncementBar.jsx";
import Explainability from "../components/landing/Explainability.jsx";
import FinalCTA from "../components/landing/FinalCTA.jsx";
import Footer from "../components/landing/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import Navbar from "../components/landing/Navbar.jsx";
import StatsBand from "../components/landing/StatsBand.jsx";

export default function LandingPage() {
  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Explainability />
        <StatsBand />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
