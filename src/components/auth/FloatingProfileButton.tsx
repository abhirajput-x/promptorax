import { User as UserIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function FloatingProfileButton() {
  const { user, profile, openLogin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const handleClick = () => {
    if (user) {
      navigate({ to: "/profile" });
    } else {
      openLogin();
    }
  };

  const initial = (profile?.display_name || profile?.username || user?.email || "?")[0]?.toUpperCase();

  return (
    <button
      onClick={handleClick}
      aria-label={user ? "Open profile" : "Sign in"}
      className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-cyan-400 text-background shadow-[0_10px_40px_-10px_oklch(0.85_0.18_210/0.6)] ring-2 ring-background/40 transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      {user ? (
        profile?.avatar ? (
          <img src={profile.avatar} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="font-display text-lg font-bold">{initial}</span>
        )
      ) : (
        <UserIcon className="h-6 w-6" />
      )}
    </button>
  );
}
