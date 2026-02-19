import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Trash2, ArrowLeft, Shield, Clock, DollarSign } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const StaffCartView = () => {
  const { items, removeItem } = useCart();
  const { user } = useAuth();

  if (!user || user.role !== "staff") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
          <Shield size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Staff Access Required</h2>
        <p className="text-muted-foreground text-sm">You must be logged in as IFCS staff to view this page.</p>
        <Link to="/login/staff" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all">
          Go to Staff Login
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-6">
            <Shield size={12} /> Staff Portal
          </div>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">IFCS Internal</p>
          <h1 className="tesla-hero-title text-white">Client Cart Overview</h1>
          <p className="tesla-hero-subtitle text-white/80 max-w-lg">
            All active client cart items across the platform.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Stats bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Items", value: items.length, icon: ShoppingCart },
              { label: "Total Value", value: `$${total}`, icon: DollarSign },
              { label: "Logged in as", value: user.username, icon: Shield },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-16 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <ShoppingCart size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Items in Cart</h3>
              <p className="text-muted-foreground text-sm max-w-xs">No clients have added items to their carts yet. Check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest text-accent">Evaluation</span>
                      {item.clientUsername && (
                        <span className="text-xs bg-muted border border-border rounded-lg px-2 py-0.5 text-muted-foreground font-medium">
                          Client: {item.clientUsername}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.serviceTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} /> {item.processingLabel} — {item.processingTime}
                      </span>
                      <span className="text-xs text-muted-foreground/60">Added: {item.addedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Price</p>
                      <p className="text-2xl font-bold text-foreground">${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 flex items-center justify-center text-destructive transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">Grand Total</p>
                  <p className="text-sm text-muted-foreground">All items combined</p>
                </div>
                <p className="text-4xl font-bold text-foreground">${total}</p>
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StaffCartView;
