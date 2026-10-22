import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { landingCopy } from "../../data/landing.js";
import Reveal from "./Reveal.jsx";

function StatCounter({ metric }) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    if (reduceMotion) return undefined;

    const start = performance.now();
    const duration = 1200;
    let frameId;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(metric.value * eased);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [visible, metric.value, reduceMotion]);

  const displayCount = reduceMotion ? metric.value : count;

  return (
    <div className="stat-cell" ref={elementRef}>
      <div className={`stat-value${metric.suffix ? " stat-value-brand" : ""}`} aria-live="off">
        {displayCount.toFixed(metric.decimals)}{metric.suffix}
      </div>
      <div className="stat-label">{metric.label}</div>
      {metric.detail && <span className="stat-detail">{metric.detail}</span>}
    </div>
  );
}

export default function StatsBand() {
  const { stats } = landingCopy;

  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <div className="site-container">
        <Reveal className="section-heading stats-heading">
          <p className="section-kicker">{stats.kicker}</p>
          <h2 className="section-title" id="stats-title">{stats.title}</h2>
        </Reveal>
        <div className="stats-grid">
          {stats.metrics.map((metric) => <StatCounter key={metric.label} metric={metric} />)}
        </div>
      </div>
    </section>
  );
}
