import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, className = "", delay = 0 }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window),
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`reveal${isVisible ? " is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: isVisible ? "0ms" : `${delay}ms` }}
    >
      {children}
    </div>
  );
}
