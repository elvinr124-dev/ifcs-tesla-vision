import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, Globe, Users, Shield, Lightbulb, ArrowRight } from "lucide-react";

const values = [
  { icon: Heart, title: "Work-Life Harmony", desc: "We value balance and support flexible work arrangements so our team can thrive both personally and professionally." },
  { icon: Globe, title: "Innovation and Impact", desc: "Every evaluation we complete helps someone take the next step in their career or education. Your work makes a real difference." },
  { icon: Users, title: "Community and Connection", desc: "Join a close-knit team that values collaboration, mentorship, and mutual support in a welcoming environment." },
  { icon: Lightbulb, title: "Professional Growth", desc: "We invest in our people through training, development opportunities, and clear pathways for career advancement." },
  { icon: Shield, title: "Integrity and Trust", desc: "Our reputation is built on accuracy and trust. We hold ourselves to the highest standards in everything we do." },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore Career Opportunities at IFCS
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            For over a decade, the Institute of Foreign Credential Services has been helping individuals navigate the complexities of international credential evaluation. We believe everyone deserves the opportunity to have their education recognized — and that starts with the dedicated people on our team.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-10">
            As a trusted credential evaluation service devoted to the success of immigrants, international students, and professionals, IFCS is an exciting place to do meaningful work. We invite you to explore our career opportunities.
          </p>
          <Link to="/careers/jobs">
            <Button size="lg" className="rounded-full px-8 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Briefcase size={20} /> View Open Positions <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Work at IFCS */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Why Work at IFCS</h2>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Joining our team at IFCS means embarking on a purpose-driven career with a direct impact on people's lives. You'll contribute daily to helping individuals have their international education recognized in the United States. Our supportive, mission-driven culture values every team member and focuses on investing in our people through mentorship, professional development, and a welcoming workplace.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <v.icon className="text-accent mb-4" size={32} />
                <h3 className="font-semibold text-foreground text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment to Diversity */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-6">
            Our Commitment to Diversity, Equity, and Inclusion
          </h2>
          <p className="text-muted-foreground mb-4">
            At IFCS, we understand the value of diverse perspectives — it's at the core of what we do every day. Our mission of evaluating international credentials means we work with education systems from around the world, and we believe our team should reflect that same global diversity.
          </p>
          <p className="text-muted-foreground mb-4">
            We are committed to providing equal opportunities to all qualified individuals, regardless of race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity or expression, veteran status, or genetics. For us, diversity goes beyond compliance — it's about embracing unique perspectives and cultivating an environment where everyone feels valued and empowered.
          </p>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-6">
            Overview of Our Application Process
          </h2>
          <p className="text-muted-foreground mb-4">
            We're passionate about creating an inclusive and accessible recruitment environment. We value diverse perspectives and believe that everyone deserves a chance to showcase their strengths and qualifications throughout the process. What we offer:
          </p>
          <ul className="space-y-3 text-muted-foreground mb-8">
            <li className="flex items-start gap-2"><span className="text-accent font-bold">•</span> A welcoming and accommodating process that provides support to all applicants</li>
            <li className="flex items-start gap-2"><span className="text-accent font-bold">•</span> A hiring team guiding you from application to final decision</li>
            <li className="flex items-start gap-2"><span className="text-accent font-bold">•</span> A fair and thorough assessment by experienced team members</li>
            <li className="flex items-start gap-2"><span className="text-accent font-bold">•</span> Personalized communication if short-listed for an interview</li>
          </ul>
          <p className="text-muted-foreground">
            If you require assistance or accommodation at any point during the recruitment process, please contact us at <a href="mailto:info@ifcsevals.com" className="text-accent hover:underline">info@ifcsevals.com</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Join the Team</h2>
          <p className="text-muted-foreground mb-8">
            Explore our job openings and discover exciting opportunities to grow, collaborate, and make an impact at IFCS.
          </p>
          <Link to="/careers/jobs">
            <Button size="lg" className="rounded-full px-10 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              See Job Openings <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
