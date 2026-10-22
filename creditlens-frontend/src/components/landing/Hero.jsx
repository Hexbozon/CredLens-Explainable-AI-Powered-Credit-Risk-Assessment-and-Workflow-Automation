import { ArrowRight, Check, Play } from "lucide-react";
import { landingCopy, shapFactors } from "../../data/landing.js";
import Button from "../ui/Button.jsx";
import RiskChip from "../ui/RiskChip.jsx";

function AssessmentPreview() {
  const { hero } = landingCopy;

  return (
    <div className="preview-column" id="demo">
      <div className="preview-float preview-float-verified">
        <span className="float-check"><Check size={11} strokeWidth={3} aria-hidden="true" /></span>
        <span>{hero.verifiedChip}</span>
      </div>
      <div className="preview-float preview-float-confidence">
        <span className="confidence-dot" aria-hidden="true" />
        <span>{hero.confidenceChip} <strong>{hero.confidenceValue}</strong></span>
      </div>

      <article className="assessment-window" aria-label={landingCopy.assessmentPreviewAlt}>
        <div className="browser-bar">
          <div className="traffic-lights" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="browser-url">
            <span>https://</span><strong>{hero.previewUrl}</strong><span>{hero.previewPath}</span>
          </div>
        </div>

        <div className="assessment-content">
          <div className="risk-overview">
            <div className="gauge-block">
              <div className="semi-gauge" role="img" aria-label={`${hero.probability} ${hero.scoreLabel}`}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <path className="gauge-track" d="M10 50 A40 40 0 0 1 90 50" />
                  <path className="gauge-value" d="M10 50 A40 40 0 0 1 90 50" />
                </svg>
                <div className="semi-gauge-value">
                  <strong>{hero.probability}</strong>
                  <span>{hero.scoreLabel}</span>
                </div>
              </div>
            </div>
            <div className="risk-summary">
              <RiskChip level={hero.risk} />
              <p>{hero.riskDescription}</p>
            </div>
          </div>

          <div className="shap-preview">
            <div className="shap-preview-heading">
              <strong>{hero.shapTitle}</strong>
              <span>{hero.shapImpact}</span>
            </div>
            <div className="shap-preview-list">
              {shapFactors.map((factor) => (
                <div className="shap-preview-row" key={factor.label}>
                  <div className="shap-preview-label">
                    <span>{factor.label}</span>
                    <strong className={factor.direction === "up" ? "impact-up" : "impact-down"}>{factor.value}</strong>
                  </div>
                  <div className="shap-preview-track" aria-hidden="true">
                    <span
                      className={factor.direction === "up" ? "shap-bar-up" : "shap-bar-down"}
                      style={{ width: `${factor.width}%` }}
                    />
                  </div>
                  <div className="shap-preview-caption">
                    <span className={factor.direction === "up" ? "impact-up" : "impact-down"}>
                      {factor.direction === "up" ? "↑" : "↓"} {factor.direction === "up" ? hero.shapUp : hero.shapDown}
                    </span>
                    <span>{factor.note}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="shap-preview-footnote">
              <span>{hero.benchmark}</span>
              <span>{hero.finalScore}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Hero() {
  const { hero } = landingCopy;

  return (
    <section className="hero-section site-container" id="product" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-badge">
          <span className="hero-badge-dot" aria-hidden="true" />
          <span>{hero.badge}</span>
        </div>
        <h1 className="hero-title" id="hero-title">
          {hero.titleStart}<br />
          <span>{hero.titleHighlight}</span>
        </h1>
        <p className="hero-subtitle">{hero.description}</p>
        <div className="hero-actions">
          <Button to="/assess">{hero.primaryAction}<ArrowRight size={16} aria-hidden="true" /></Button>
          <Button variant="secondary" href="#demo"><Play size={14} aria-hidden="true" />{hero.secondaryAction}</Button>
        </div>
        <p className="hero-proof">{hero.proof}</p>
      </div>
      <AssessmentPreview />
    </section>
  );
}
