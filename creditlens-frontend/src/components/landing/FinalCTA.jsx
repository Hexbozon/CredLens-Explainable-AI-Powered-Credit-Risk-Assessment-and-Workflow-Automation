import { ArrowRight, Play } from "lucide-react";
import { landingCopy } from "../../data/landing.js";
import Button from "../ui/Button.jsx";
import Reveal from "./Reveal.jsx";

export default function FinalCTA() {
  const { finalCta } = landingCopy;

  return (
    <section className="cta-section site-container">
      <Reveal>
        <div className="cta-panel">
          <div className="cta-badge"><span className="hero-badge-dot" />{finalCta.badge}</div>
          <h2 className="cta-title">{finalCta.title}<br /><span>{finalCta.titleHighlight}</span></h2>
          <p className="cta-copy">{finalCta.description}</p>
          <div className="cta-actions">
            <Button to="/assess">{finalCta.action}<ArrowRight size={16} aria-hidden="true" /></Button>
            <Button variant="secondary" href="#demo"><Play size={14} aria-hidden="true" />{finalCta.secondaryAction}</Button>
          </div>
          <p className="cta-note">{finalCta.note}</p>
        </div>
      </Reveal>
    </section>
  );
}
