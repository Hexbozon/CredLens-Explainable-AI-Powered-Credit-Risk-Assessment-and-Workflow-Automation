import Footer from "../components/landing/Footer.jsx";
import AssessmentForm from "../components/ui/AssessmentForm.jsx";
import Navbar from "../components/landing/Navbar.jsx";
import { landingCopy } from "../data/landing.js";

export default function AssessmentPage() {
  const { demo } = landingCopy;

  return (
    <div className="page-shell">
      <Navbar />
      <main className="assessment-page">
        <div className="site-container assessment-heading">
          <h1>{demo.pageTitle}</h1>
          <p>{demo.pageDescription}</p>
        </div>
        <div className="site-container">
          <AssessmentForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
