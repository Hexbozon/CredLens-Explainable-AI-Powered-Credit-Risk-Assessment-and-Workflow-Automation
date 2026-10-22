import { BadgeCheck, FileCheck2, FileText, ShieldCheck } from "lucide-react";
import { landingCopy } from "../../data/landing.js";
import Card from "../ui/Card.jsx";
import Reveal from "./Reveal.jsx";

const stepIcons = {
  score: FileText,
  explain: BadgeCheck,
  audit: FileCheck2,
};

export default function HowItWorks() {
  const { how } = landingCopy;

  return (
    <section className="section-block" id="how-it-works" aria-labelledby="how-title">
      <div className="site-container">
        <Reveal className="section-heading section-heading-left">
          <p className="section-kicker">{how.kicker}</p>
          <h2 className="section-title" id="how-title">{how.title}</h2>
          <p className="section-description">{how.description}</p>
        </Reveal>
        <div className="steps-grid">
          {how.steps.map((step, index) => {
            const Icon = stepIcons[step.icon] || ShieldCheck;
            return (
              <Reveal key={step.number} delay={index * 70}>
                <Card className="step-card">
                  <div className="step-card-main">
                    <div className="step-card-top">
                      <span className="step-number">STEP {step.number}</span>
                      <span className="step-icon"><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span>
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                  <div className="step-detail">{step.detail}</div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
