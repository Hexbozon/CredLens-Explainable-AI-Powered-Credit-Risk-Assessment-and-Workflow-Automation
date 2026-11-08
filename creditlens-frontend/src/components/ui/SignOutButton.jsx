import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAccessToken } from "../../lib/auth.js";

export default function SignOutButton({ className = "" }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearAccessToken();
    navigate("/login", { replace: true });
  };

  return (
    <button
      type="button"
      title="Log out"
      aria-label="Log out"
      onClick={handleSignOut}
      className={`flex h-9 items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 lg:w-9 lg:px-0 ${className}`.trim()}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="pr-2 text-sm font-medium lg:hidden">Log out</span>
    </button>
  );
}
