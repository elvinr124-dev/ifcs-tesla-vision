import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Shield, ArrowRight } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const Login = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] min-h-[300px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Welcome Back</p>
          <h1 className="tesla-hero-title text-white">Sign In to IFCS</h1>
          <p className="tesla-hero-subtitle text-white/80 max-w-lg">
            Select your account type to continue.
          </p>
        </div>
      </section>

      {/* Login type cards */}
      <section className="py-20 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Client Login */}
          <div className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl hover:shadow-accent/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-accent/15 border border-accent/30 flex items-center justify-center shadow-lg shadow-accent/20">
                <User size={36} className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Client Login</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Access your evaluation orders, track status, and manage your applications.
                </p>
              </div>
              <Link
                to="/login/client"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 hover:shadow-accent/50 transition-all duration-200 hover:scale-105"
              >
                Client Login <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Don't have an account? <span className="font-semibold text-accent underline underline-offset-2">Sign Up</span>
              </Link>
            </div>
          </div>

          {/* Staff Login */}
          <div className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
            <div className="h-1 bg-gradient-to-r from-foreground/40 via-foreground/20 to-transparent" />
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-muted border border-border flex items-center justify-center shadow-lg">
                <Shield size={36} className="text-foreground/60" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Staff Login</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  IFCS staff members can view client carts, orders, and manage applications.
                </p>
              </div>
              <Link
                to="/login/staff"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-border bg-muted/50 text-foreground text-sm font-semibold hover:bg-muted transition-all duration-200 hover:scale-105"
              >
                Staff Login <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-muted-foreground/60">IFCS internal access only</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
