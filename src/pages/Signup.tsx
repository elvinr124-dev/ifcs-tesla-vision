import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const GlassInput = ({
  value, onChange, placeholder, type = "text", maxLength,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; maxLength?: number;
}) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm"
  />
);

const FieldGroup = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
    </Label>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground border-b border-border pb-2 mb-4">
    {children}
  </p>
);

const Signup = () => {
  const { signupClient } = useAuth();
  const navigate = useNavigate();
  const { translate } = useLocale();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [appCode, setAppCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password || !gender) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await signupClient({ firstName, lastName, email, password, gender, appCode });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Signup failed.");
      return;
    }
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> {translate("Back to Login")}
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">{translate("New Account")}</p>
          <h1 className="tesla-hero-title text-white">{translate("Create Your Account")}</h1>
        </div>
      </section>

      <section className="py-16 px-6 content-bg">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-8 md:p-10 space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{translate("Join IFCS")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{translate("Create your client account to start an evaluation")}</p>
              </div>

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <SectionHeading>{translate("Personal Information")}</SectionHeading>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={translate("First Name")} required>
                    <GlassInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" maxLength={50} />
                  </FieldGroup>
                  <FieldGroup label={translate("Last Name")} required>
                    <GlassInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" maxLength={50} />
                  </FieldGroup>
                </div>
                <FieldGroup label={translate("Gender")} required>
                  <div className="flex gap-3">
                    {["Male", "Female"].map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g.toLowerCase())}
                        className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                          gender === g.toLowerCase()
                            ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30"
                            : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        }`}>{g}</button>
                    ))}
                  </div>
                </FieldGroup>
              </div>

              <div className="space-y-4">
                <SectionHeading>{translate("Account Details")}</SectionHeading>
                <FieldGroup label={translate("Email Address")} required>
                  <GlassInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" maxLength={255} />
                </FieldGroup>
                <FieldGroup label={translate("Password")} required>
                  <div className="relative">
                    <GlassInput value={password} onChange={(e) => setPassword(e.target.value)} type={showPass ? "text" : "password"} placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FieldGroup>
                <FieldGroup label="Confirm Password" required>
                  <GlassInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Re-enter password" />
                </FieldGroup>
              </div>

              <div className="space-y-3">
                <SectionHeading>Reference Number (Optional)</SectionHeading>
                <p className="text-xs text-muted-foreground -mt-2">If you have an IFCS reference number from a previous application, enter it here to track your order.</p>
                <GlassInput value={appCode} onChange={(e) => setAppCode(e.target.value)} placeholder="e.g. 44507" maxLength={20} />
              </div>

              <button onClick={handleSignup} disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none">
                <UserPlus size={16} /> {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login/client" className="font-semibold text-accent hover:underline underline-offset-2">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default Signup;
