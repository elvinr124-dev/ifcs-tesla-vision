import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ClientLogin = () => {
  const { loginClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Forgot password states
  const [forgotMode, setForgotMode] = useState<"idle" | "email" | "code" | "reset">("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const locationState = location.state as { redirectTo?: string; serviceData?: any } | null;

  // Load remembered credentials
  useEffect(() => {
    const saved = localStorage.getItem("ifcs_remembered_login");
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(saved);
        setEmail(e);
        setPassword(p);
        setRememberMe(true);
      } catch {}
    }
  }, []);

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email/username and password.");
      return;
    }
    const ok = loginClient(email, password);
    if (ok) {
      if (rememberMe) {
        localStorage.setItem("ifcs_remembered_login", JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem("ifcs_remembered_login");
      }
      if (locationState?.redirectTo) {
        navigate(locationState.redirectTo, { state: locationState.serviceData });
      } else {
        navigate("/dashboard/client");
      }
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  const handleSendResetCode = async () => {
    setForgotError("");
    if (!resetEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    setForgotLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase
      .from("password_reset_codes")
      .insert({ email: resetEmail.trim(), code, expires_at: expiresAt });

    if (insertErr) {
      setForgotError("Failed to send reset code. Try again.");
      setForgotLoading(false);
      return;
    }

    // Invoke edge function to send email
    try {
      await supabase.functions.invoke("send-reset-code", {
        body: { email: resetEmail.trim(), code },
      });
    } catch {}

    toast({ title: "Code Sent", description: `A 6-digit code has been sent to ${resetEmail}.` });
    setForgotMode("code");
    setForgotLoading(false);
  };

  const handleVerifyCode = async () => {
    setForgotError("");
    if (!resetCode.trim()) {
      setForgotError("Please enter the 6-digit code.");
      return;
    }
    const { data } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", resetEmail.trim())
      .eq("code", resetCode.trim())
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      setForgotError("Invalid or expired code. Please try again.");
      return;
    }
    setForgotMode("reset");
  };

  const handleResetPassword = async () => {
    setForgotError("");
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    // Mark code as used
    await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("email", resetEmail.trim())
      .eq("code", resetCode.trim());

    toast({ title: "Password Reset", description: "Your password has been reset. You can now log in." });
    setForgotMode("idle");
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Forgot password UI
  if (forgotMode !== "idle") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-20 px-6">
          <div className="max-w-md mx-auto">
            <button onClick={() => setForgotMode("idle")} className="inline-flex items-center gap-2 text-sm font-medium mb-8 text-accent hover:underline">
              <ArrowLeft size={16} /> Back to Login
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {forgotMode === "email" && "Forgot Password"}
              {forgotMode === "code" && "Enter Verification Code"}
              {forgotMode === "reset" && "Reset Password"}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {forgotMode === "email" && "Enter your email and we'll send you a verification code."}
              {forgotMode === "code" && `We sent a 6-digit code to ${resetEmail}.`}
              {forgotMode === "reset" && "Enter your new password below."}
            </p>

            {forgotError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium mb-6">
                {forgotError}
              </div>
            )}

            {forgotMode === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-accent uppercase tracking-wider">Email Address <span className="text-destructive">*</span></label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full mt-1 h-12 px-0 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button
                  onClick={handleSendResetCode}
                  disabled={forgotLoading}
                  className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {forgotMode === "code" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-accent uppercase tracking-wider">6-Digit Code <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full mt-1 h-12 px-0 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors tracking-[0.5em] text-center text-lg font-mono"
                  />
                </div>
                <button onClick={handleVerifyCode} className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all">
                  Verify Code
                </button>
                <button onClick={() => { setForgotMode("email"); setResetCode(""); }} className="w-full text-sm text-muted-foreground hover:text-accent transition-colors">
                  Didn't receive a code? Resend
                </button>
              </div>
            )}

            {forgotMode === "reset" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-accent uppercase tracking-wider">New Password <span className="text-destructive">*</span></label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full mt-1 h-12 px-0 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-accent uppercase tracking-wider">Confirm Password <span className="text-destructive">*</span></label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full mt-1 h-12 px-0 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button onClick={handleResetPassword} className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all">
                  Reset Password
                </button>
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-foreground text-foreground text-sm font-semibold hover:bg-foreground hover:text-background transition-all"
            >
              Create Account
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-10">Login to IFCS Portal</h1>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Email/Username */}
            <div>
              <label className="text-xs font-medium text-accent uppercase tracking-wider">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full mt-1 h-12 px-0 text-sm text-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-accent uppercase tracking-wider">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full mt-1 h-12 px-0 pr-10 text-sm text-foreground bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-accent transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-foreground">Remember me</span>
              </label>
              <button
                onClick={() => setForgotMode("email")}
                className="text-sm font-medium text-accent hover:underline underline-offset-2"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              className="w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all hover:scale-[1.01]"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClientLogin;
