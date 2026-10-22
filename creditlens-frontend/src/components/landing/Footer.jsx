import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { landingCopy } from "../../data/landing.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner site-container">
        <Link className="brand footer-brand" to="/" aria-label={`${landingCopy.brand} home`}>
          <span className="brand-mark"><Shield size={15} aria-hidden="true" /></span>
          <span>{landingCopy.brand}</span>
          <span className="footer-tagline">· {landingCopy.footer.tagline}</span>
        </Link>
        <nav className="footer-links" aria-label={landingCopy.footerNavigationLabel}>
          {landingCopy.footer.links.map((item) => (
            item.target.startsWith("/") ? (
              <Link key={item.label} to={item.target}>{item.label}</Link>
            ) : (
              <a key={item.label} href={item.target}>{item.label}</a>
            )
          ))}
        </nav>
        <span className="footer-copy">{landingCopy.footer.copyright}</span>
      </div>
    </footer>
  );
}
