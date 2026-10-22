import { Check } from "lucide-react";
import { landingCopy } from "../../data/landing.js";
import Reveal from "./Reveal.jsx";

export default function Explainability() {
  const { features } = landingCopy;

  return (
    <section className="explainability-section" id="model" aria-labelledby="explainability-title">
      <div className="site-container explainability-grid">
        <Reveal>
          <article className="explainability-card">
            <div className="explainability-card-head">
              <div>
                <span className="section-kicker">{features.chartEyebrow}</span>
                <h3>{features.chartTitle}</h3>
              </div>
              <div className="shap-legend">
                <span><i className="legend-swatch legend-up" />{features.pushesUp}</span>
                <span><i className="legend-swatch legend-down" />{features.pushesDown}</span>
              </div>
            </div>
            <div className="explainability-factors">
              {features.factors.map((factor) => (
                <div className="explainability-factor" key={factor.label}>
                  <div className="explainability-factor-label">
                    <span>{factor.label}</span>
                    <strong className={factor.direction === "up" ? "impact-up" : "impact-down"}>{factor.value}</strong>
                  </div>
                  <div className="explainability-track" aria-hidden="true">
                    <span
                      className={factor.direction === "up" ? "shap-bar-up" : "shap-bar-down"}
                      style={{ width: `${factor.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="explainability-footnote">
              <span>{features.baseRate}</span>
              <span>{features.finalScore}</span>
            </div>
          </article>
        </Reveal>

        <Reveal className="explainability-copy" delay={90}>
          <div className="section-kicker explainability-badge">{features.kicker}</div>
          <h2 className="section-title" id="explainability-title">{features.title}</h2>
          <p>{features.description}</p>
          <ul>
            {features.bullets.map((bullet) => (
              <li key={bullet}>
                <span><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
