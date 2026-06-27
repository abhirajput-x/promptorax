import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.7 0 19.5-7.8 19.5-19.5 0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 7 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.3-4.3 2-6.9 2-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 38.6 16.2 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5c-.4.4 6.5-4.7 6.5-14.7 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export function LoginModal() {
  const { modalOpen, closeLogin } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogle = async () => {
    setBusy("google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(null);
    }
  };

  const handleOAuth = async (provider: "facebook" | "twitter") => {
    setBusy(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        if (error.message?.toLowerCase().includes("provider is not enabled")) {
          toast.error(`${provider === "twitter" ? "X" : "Facebook"} login not enabled yet. Configure it in Backend → Authentication → Providers.`);
        } else {
          toast.error(error.message);
        }
      }
    } finally {
      setBusy(null);
    }
  };

  const sendOtp = async () => {
    if (!phone.match(/^\+\d{8,15}$/)) {
      toast.error("Use international format, e.g. +14155552671");
      return;
    }
    setBusy("phone");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(null);
    if (error) {
      toast.error(error.message.includes("not enabled")
        ? "Phone login not enabled. Configure SMS provider in Backend → Auth."
        : error.message);
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent");
  };

  const verifyOtp = async () => {
    setBusy("phone");
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
  };

  const ProviderBtn = ({ onClick, icon, label, id }: { onClick: () => void; icon: ReactNode; label: string; id: string }) => (
    <button
      onClick={onClick}
      disabled={busy !== null}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
    >
      {busy === id ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );

  return (
    <Dialog open={modalOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent className="max-w-md border-border/40 bg-secondary/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Welcome to <span className="text-primary">Promptora</span>
          </DialogTitle>
          <DialogDescription>Sign in to copy prompts, save favorites, and follow creators.</DialogDescription>
        </DialogHeader>

        {!phoneMode ? (
          <div className="mt-2 space-y-2.5">
            <ProviderBtn id="google" onClick={handleGoogle} icon={<GoogleIcon />} label="Continue with Google" />
            <ProviderBtn id="facebook" onClick={() => handleOAuth("facebook")} icon={<span className="grid h-5 w-5 place-items-center rounded bg-[#1877F2] text-xs font-bold text-white">f</span>} label="Continue with Facebook" />
            <ProviderBtn id="twitter" onClick={() => handleOAuth("twitter")} icon={<span className="grid h-5 w-5 place-items-center rounded bg-black text-xs font-bold text-white">𝕏</span>} label="Continue with X" />
            <ProviderBtn id="phone" onClick={() => setPhoneMode(true)} icon={<Phone className="h-5 w-5 text-primary" />} label="Continue with Phone" />
            <p className="pt-2 text-center text-[11px] text-muted-foreground">
              By continuing you agree to our terms.
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {!otpSent ? (
              <>
                <label className="block text-xs font-medium text-muted-foreground">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14155552671"
                  className="h-11 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary"
                />
                <button onClick={sendOtp} disabled={busy === "phone"} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-sm font-semibold text-background disabled:opacity-50">
                  {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <label className="block text-xs font-medium text-muted-foreground">Enter 6-digit code sent to {phone}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="h-11 w-full rounded-xl border border-border bg-background/40 px-4 text-center text-lg tracking-[0.5em] outline-none focus:border-primary"
                />
                <button onClick={verifyOtp} disabled={busy === "phone" || otp.length !== 6} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-sm font-semibold text-background disabled:opacity-50">
                  {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign in"}
                </button>
              </>
            )}
            <button onClick={() => { setPhoneMode(false); setOtpSent(false); setOtp(""); }} className="w-full text-center text-xs text-muted-foreground hover:text-primary">
              ← Back to all options
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type ReactNode = import("react").ReactNode;
