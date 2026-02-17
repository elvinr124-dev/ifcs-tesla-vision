import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";

const Contact = () => (
  <div className="bg-background min-h-screen">
    <Navbar />

    <section className="tesla-section bg-primary">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
      <div className="tesla-section-content text-primary-foreground animate-fade-in-up">
        <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80">Get in Touch</p>
        <h1 className="tesla-hero-title">Contact Us</h1>
        <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 opacity-80">
          Have questions? We're here to help with your credential evaluation and translation needs.
        </p>
      </div>
    </section>

    <section className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: MapPin, title: "Address", lines: ["6 Cedar Street", "Dobbs Ferry, NY 10522"] },
          { icon: Mail, title: "Email", lines: ["info@ifcsevals.com"] },
          { icon: Phone, title: "Phone", lines: ["Contact us via our website"] },
          { icon: Clock, title: "Hours", lines: ["Monday – Friday", "9:00 AM – 5:00 PM EST"] },
        ].map(({ icon: Icon, title, lines }) => (
          <div key={title} className="p-8 rounded-sm border border-border bg-card">
            <Icon size={24} className="text-accent mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            {lines.map((l) => (
              <p key={l} className="text-sm text-muted-foreground">{l}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <a
          href="https://ifcsevals.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="tesla-btn-primary inline-block"
        >
          Send a Message
        </a>
      </div>
    </section>

    <div className="text-center pb-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>

    <Footer />
  </div>
);

export default Contact;
