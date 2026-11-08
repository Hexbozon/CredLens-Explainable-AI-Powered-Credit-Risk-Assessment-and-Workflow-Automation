import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, getAccessToken } from "../lib/auth.js";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(getAccessToken()),
  );

  useEffect(() => {
    const updateAuthentication = () => {
      setIsAuthenticated(Boolean(getAccessToken()));
    };

    window.addEventListener(AUTH_CHANGE_EVENT, updateAuthentication);
    window.addEventListener("storage", updateAuthentication);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, updateAuthentication);
      window.removeEventListener("storage", updateAuthentication);
    };
  }, []);

  return isAuthenticated;
}
