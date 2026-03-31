import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { ArrowLeft, Award, Globe, ShieldCheck, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import aboutBg from "@/assets/about-bg.jpg";
import agronImg from "@/assets/agron-matoshi.jpg";
import veraImg from "@/assets/vera-memaci.jpg";

const values = [
  { icon: Award, title: "Excellence", desc: "We uphold the highest standards in credential evaluation and translation." },
  { icon: Globe, title: "Global Reach", desc: "Serving clients from 190+ countries with evaluations recognized across the U.S." },
  { icon: ShieldCheck, title: "Integrity", desc: "Every evaluation is accurate, thorough, and compliant with industry standards." },
  { icon: Users, title: "Client-Centered", desc: "Personalized service tailored to each client's unique academic background." },
];

const affiliations = [
  { name: "NACES", full: "National Association of Credential Evaluation Services" },
  { name: "NAFSA", full: "National Association of Foreign Student Advisers" },
  { name: "AACRAO", full: "American Association of Collegiate Registrars and Admissions Officers" },
  { name: "TAICEP", full: "The Association for International Credential Evaluation Professionals" },
  { name: "NAGAP", full: "Association for Graduate Enrollment Management" },
  { name: "EAIE", full: "European Association for International Education" },
];

const founders = [
  {
    name: "Agron Matoshi, M.A.",
    role: "Co-Founder",
    image: agronImg,
    short: "Agron Matoshi has more than a decade of professional experience evaluating foreign academic credentials and international admissions.",
    full: `Agron Matoshi has more than a decade of professional experience evaluating foreign academic credentials and international admissions. An established expert on all levels of education around the world, he has participated in dozens of panel discussions, presentations, workshops and publications on international education and related topics.

Before joining the Institute of Foreign Credential Services, Agron worked as a Senior Credentials Analyst at SpanTran Evaluation Services where he established policies for evaluation of foreign credentials, trained and supervised staff, and created training manuals. Prior to that he was a consultant at Morningside Evaluations.

Agron served in various capacities with the City University of New York. He began his career in higher education at Lehman College as an Admissions Advisor and soon after became responsible for advising international students and evaluating international credentials for undergraduate, graduate, adult degree and continuing education programs. He also worked closely with deans and directors of departments to establish several dual degree and exchange programs, including the Korean Nursing Program, Sungshin Visitor Program, Turkish Exchange Program, Antigua Nursing Program and MD to BSN Program.

Agron is a recognized opinion leader who has delivered presentations on the educational systems of Albania, Kosova, and Macedonia. He is also the co-author of NAFSA's Online Guide to Educational Systems Around the World: Albania.

Agron holds a Master of Arts in Economics from the City College of New York and graduated Magna Cum Laude with a B.A. in Economics from Lehman College, CUNY.`,
  },
  {
    name: "Vera Memaçi, M.A., Ph.D. Candidate",
    role: "Co-Founder",
    image: veraImg,
    short: "A gifted educator, Vera Memaçi has been an Adjunct Professor at Lehman College, teaching courses in mathematics. She is pursuing her doctorate at Columbia University.",
    full: `A gifted educator herself, Vera Memaçi has been an Adjunct Professor at Lehman College, Bronx, New York, teaching courses in mathematics. She is currently pursuing her doctorate in Mathematics Education at Columbia University.

Vera has received numerous awards and honors, including the Peter Jennings Scholarship Laurel Award, McNair Scholarship, Computer Science and Mathematics Scholarship, College Transition Fellowship, and Minority Scholarships of the Teachers College Columbia University; and she has been elected to the Golden Key International Honor Society as well as Phi Beta Kappa and Pi Mu Epsilon Honor Societies.

Vera has been a member of the Association of Teachers of Mathematics of NYC, National Council of Teachers of Mathematics, and Association of Mathematics Teachers of New York State.

Vera holds a Master of Arts in Mathematics and a B.A. in Mathematics (Magna Cum Laude), both from Lehman College. She is also a Certified Mathematics Teacher.`,
  },
];

const FounderCard = ({ founder }: { founder: typeof founders[0] }) => {
  const [expanded, setExpanded] = useState(false);
  const { translate } = useLocale();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-accent/20 mb-6 shadow-lg">
        <img src={founder.image} alt={founder.name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{founder.name}</h3>
      <p className="text-sm font-medium text-accent mb-3">{translate(founder.role)}</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
        {expanded ? founder.full.split("\n\n").map((p, i) => (
          <span key={i} className="block mb-3">{translate(p)}</span>
        )) : translate(founder.short)}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
      >
        {expanded ? translate("Show Less") : translate("Read More")}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
};

const About = () => {
  const { translate } = useLocale();

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${aboutBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center animate-fade-in-up hero-text-shadow">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-white">{translate("Our Story")}</p>
          <h1 className="tesla-hero-title text-white">{translate("About TFCS")}</h1>
          <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 text-white/90">
            {translate("The Institute of Foreign Credential Services has been helping international students and professionals get their credentials recognized since its founding.")}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 text-center">{translate("Who We Are")}</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-10 text-center">
            {translate("Trusted by Universities & Employers")}
          </h2>
          <div className="space-y-5 text-base text-muted-foreground leading-relaxed">
            <p>{translate("With IFCS, you have direct access to a group of the industry's most experienced professionals with extensive success in international education, foreign credential evaluations, university admission, academic advising, and university teaching. We help individuals educated abroad get their education recognized by universities, employers, immigration and certification boards in the United States.")}</p>
            <p>{translate("With more than 50 years of accumulated comprehensive professional experience from our senior staff, our company provides best in-class evaluations that are accepted by institutions across the United States.")}</p>
            <p>{translate("Our service excellence is immediately noticeable in the level of individual attention to each of our clients and it is further evidenced in the accurate evaluations delivered in accordance with industry standards and guidelines set by the National Council on the Evaluation of Foreign Educational Credentials.")}</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 content-bg-alt">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center p-8 rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300">
                <v.icon size={32} className="text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{translate(v.title)}</h3>
                <p className="text-sm text-muted-foreground">{translate(v.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 text-center">{translate("Leadership")}</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-16 text-center">
            {translate("Meet Our Founders")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {founders.map((f) => (
              <FounderCard key={f.name} founder={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 content-bg-alt">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3 text-center">{translate("Memberships")}</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-12 text-center">
            {translate("Professional Affiliations")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliations.map((a) => (
              <div key={a.name} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all duration-300">
                <span className="text-lg font-bold text-accent tracking-tight shrink-0">{a.name}</span>
                <p className="text-xs text-muted-foreground leading-snug">{translate(a.full)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default About;
