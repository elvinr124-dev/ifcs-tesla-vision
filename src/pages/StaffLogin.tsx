import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const GlassInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
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

const StaffLogin = () => {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const ok = loginStaff(username, password);
    if (ok) {
      navigate("/dashboard/staff");
    } else {
      setError("Invalid staff credentials. IFCS internal access only.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">IFCS Internal</p>
          <h1 className="tesla-hero-title text-white">Staff Login</h1>
        </div>
      </section>

      <section className="py-16 px-6 content-bg">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-foreground/40 via-foreground/20 to-transparent" />
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <Shield size={18} className="text-foreground/60" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Staff Portal</h2>
                  <p className="text-sm text-muted-foreground">IFCS internal access only</p>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <FieldGroup label="Staff Username" required>
                  <GlassInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Staff username" />
                </FieldGroup>
                <FieldGroup label="Password" required>
                  <div className="relative">
                    <GlassInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPass ? "text" : "password"}
                      placeholder="Staff password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FieldGroup>
              </div>

              <button
                onClick={handleLogin}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-border bg-muted/50 text-foreground text-sm font-semibold hover:bg-muted transition-all duration-200 hover:scale-105"
              >
                <Shield size={16} /> Sign In as Staff
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StaffLogin;
