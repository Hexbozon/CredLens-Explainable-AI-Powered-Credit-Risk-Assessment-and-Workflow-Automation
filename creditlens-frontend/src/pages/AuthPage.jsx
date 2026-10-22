import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { landingCopy } from "../data/landing.js";
import { loginUser } from "../lib/api.js";
import Button from "../components/ui/Button.jsx";
import Footer from "../components/landing/Footer.jsx";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { auth } = landingCopy;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser({ email, password });
      const token = response?.access_token ?? response?.token;
      if (token) window.localStorage.setItem("creditlens_token", token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(typeof requestError.message === "string" ? requestError.message : auth.authenticationError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <main className="auth-page">
        <div className="site-container auth-layout">
          <section className="auth-card" aria-labelledby="auth-title">
            <Link className="brand" to="/" aria-label={landingCopy.brand}>
              <span className="brand-mark"><Shield size={18} aria-hidden="true" /></span>
              <span>{landingCopy.brand}</span>
            </Link>
            <h1 id="auth-title">{isRegister ? auth.registerTitle : auth.loginTitle}</h1>
            <p className="auth-description">{isRegister ? auth.registerDescription : auth.loginDescription}</p>
            {isRegister ? (
              <>
                <p className="auth-notice">{auth.registerNotice}</p>
                <Button variant="secondary" to="/login">{auth.signInLink}</Button>
              </>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="field">
                  <span className="field-label">{auth.email}</span>
                  <input
                    className="field-control"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="field">
                  <span className="field-label">{auth.password}</span>
                  <input
                    className="field-control"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
                {error && <p className="demo-error" role="alert">{error}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? auth.loginLoading : auth.loginAction}
                </Button>
              </form>
            )}
            <p className="auth-switch">
              {isRegister ? auth.hasAccount : auth.noAccount}{" "}
              <Link to={isRegister ? "/login" : "/register"}>
                {isRegister ? auth.signInLink : auth.createAccount}
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
