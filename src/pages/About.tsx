import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Award, Globe, ShieldCheck, Users } from "lucide-react";

const values = [
  { icon: Award, title: "Excellence", desc: "We uphold the highest standards in credential evaluation and translation." },
  { icon: Globe, title: "Global Reach", desc: "Serving clients from 190+ countries with evaluations recognized across the U.S." },
  { icon: ShieldCheck, title: "Integrity", desc: "Every evaluation is accurate, thorough, and compliant with industry standards." },
  { icon: Users, title: "Client-Centered", desc: "Personalized service tailored to each client's unique academic background." },
];

const About = () => (
  <div className="bg-background min-h-screen">
    <Navbar />

    <section className="tesla-section bg-primary">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
      <div className="tesla-section-content text-primary-foreground animate-fade-in-up">
        <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80">Our Story</p>
        <h1 className="tesla-hero-title">About IFCS</h1>
        <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 opacity-80">
          The Institute of Foreign Credential Services has been helping international students and professionals get their credentials recognized since its founding.
        </p>
      </div>
    </section>

    <section className="py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3">Who We Are</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
            Trusted by Universities & Employers
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Located in Dobbs Ferry, New York, IFCS provides academic evaluations, certified translations, and expert consulting to individuals and institutions nationwide. Our team of senior evaluators brings decades of combined experience in international education.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="text-center p-8 rounded-sm border border-border bg-card">
              <v.icon size={32} className="text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
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

export default About;
