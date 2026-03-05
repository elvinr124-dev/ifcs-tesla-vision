import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import cartBg from "@/assets/cart-bg.jpg";

const Cart = () => {
  const { items, removeItem, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cartBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 hero-text-shadow">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Your Selection</p>
          <h1 className="tesla-hero-title text-white">Your Cart</h1>
          <p className="tesla-hero-subtitle text-white/90 max-w-lg">
            Review your evaluation services before proceeding to payment.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-16 flex flex-col items-center gap-5 text-center shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <ShoppingCart size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Browse our evaluation services and add them to your cart to get started.
              </p>
              <Link
                to="/evaluations"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105"
              >
                Browse Evaluations <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">Academic Evaluation</span>
                    <h3 className="text-lg font-bold text-foreground">{item.serviceTitle}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock size={13} />
                      <span>{item.processingLabel} — {item.processingTime}</span>
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
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">Order Total</p>
                    <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">${total}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/application"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105"
                  >
                    Proceed to Application <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold hover:bg-destructive/15 transition-all duration-200"
                  >
                    <Trash2 size={16} /> Clear Cart
                  </button>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link to="/evaluations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={16} /> Add More Services
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
