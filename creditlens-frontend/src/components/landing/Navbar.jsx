import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { landingCopy } from "../../data/landing.js";
import Button from "../ui/Button.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <nav className="navbar site-container" aria-label={landingCopy.mainNavigationLabel}>
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)} aria-label={`${landingCopy.brand} home`}>
            <span className="brand-mark"><ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="brand-copy">
              <strong>{landingCopy.brand}</strong>
              <small>{landingCopy.brandTagline}</small>
            </span>
          </Link>

          <div className={`nav-links${menuOpen ? " is-open" : ""}`} id="primary-navigation">
            {landingCopy.navigation.map((item) => (
              <a key={item.label} href={item.target} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link className="mobile-nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>{landingCopy.dashboard}</Link>
            <Link className="mobile-nav-link" to="/login" onClick={() => setMenuOpen(false)}>{landingCopy.signIn}</Link>
          </div>

          <div className="nav-actions">
            <Link className="nav-signin" to="/dashboard">{landingCopy.dashboard}</Link>
            <Link className="nav-signin" to="/login">{landingCopy.signIn}</Link>
            <Button className="nav-cta" to="/register">{landingCopy.getStarted}</Button>
          </div>

          <button
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? landingCopy.closeMenuLabel : landingCopy.openMenuLabel}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </nav>
      </header>
    </>
  );
}
