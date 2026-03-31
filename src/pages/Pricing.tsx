import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useLocale } from "@/context/LocaleContext";

const evaluationPricing = [
  {
    title: "General Analysis",
    slug: "general-analysis",
    standard: 100,
    rush3Day: 150,
    rush24Hr: 195,
  },
  {
    title: "General Analysis plus GPA",
    slug: "general-analysis-plus-gpa",
    standard: 150,
    rush3Day: 205,
    rush24Hr: 295,
  },
  {
    title: "Cosmetology Course-by-Course",
    slug: "cosmetology-course-by-course",
    standard: 170,
    rush3Day: 275,
    rush24Hr: 375,
  },
  {
    title: "Course-by-Course",
    slug: "course-by-course",
    standard: 190,
    rush3Day: 290,
    rush24Hr: 425,
  },
  {
    title: "Health Professions Course-by-Course",
    slug: "health-professions-course-by-course",
    standard: 230,
    rush3Day: 355,
    rush24Hr: 490,
  },
  {
    title: "Comprehensive Course-by-Course",
    slug: "comprehensive-course-by-course",
    standard: 290,
    rush3Day: 390,
    rush24Hr: 490,
  },
  {
    title: "High School and University Course-by-Course",
    slug: "high-school-and-university-course-by-course",
    standard: 295,
    rush3Day: 395,
    rush24Hr: 495,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          Pricing for Credential Evaluations
        </h1>
        <p className="text-lg text-accent font-medium">
          Check out our industry-leading affordable pricing!
        </p>
      </section>

      {/* Pricing Table */}
      <section className="max-w-[1100px] mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-border overflow-hidden shadow-2xl bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="text-foreground font-bold text-sm tracking-wide py-5 px-6 w-[280px]">
                  {translate("Evaluation Type")}
                </TableHead>
                <TableHead className="text-center text-foreground font-bold text-sm tracking-wide py-5 px-4">
                  {translate("Standard")}
                  <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">
                    {translate("8–10 Business Days")}
                  </span>
                </TableHead>
                <TableHead className="text-center text-foreground font-bold text-sm tracking-wide py-5 px-4">
                  {translate("3-Day Rush")}
                  <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">
                    {translate("3 Business Days")}
                  </span>
                </TableHead>
                <TableHead className="text-center text-foreground font-bold text-sm tracking-wide py-5 px-4">
                  {translate("24-Hour Rush")}
                  <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">
                    {translate("Next Business Day")}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationPricing.map((item, i) => (
                <TableRow
                  key={item.title}
                  className={`border-b border-border/50 transition-colors ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <TableCell className="py-5 px-6">
                    <Link
                      to={`/evaluations#${item.slug}`}
                      className="font-semibold text-sm text-foreground underline decoration-accent/40 underline-offset-2 hover:text-accent transition-colors"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center py-5 px-4 text-accent font-bold text-base">
                    ${item.standard}
                  </TableCell>
                  <TableCell className="text-center py-5 px-4 text-accent font-bold text-base">
                    ${item.rush3Day}
                  </TableCell>
                  <TableCell className="text-center py-5 px-4 text-accent font-bold text-base">
                    ${item.rush24Hr}
                  </TableCell>
                </TableRow>
              ))}

              {/* Extra copies row */}
              <TableRow className="border-b border-border/50 bg-muted/20">
                <TableCell className="py-5 px-6">
                  <Link
                    to="/duplicate-reports"
                    className="font-semibold text-sm text-foreground underline decoration-accent/40 underline-offset-2 hover:text-accent transition-colors italic"
                  >
                    Extra Copies
                  </Link>
                </TableCell>
                <TableCell className="text-center py-5 px-4 text-accent font-bold text-base" colSpan={3}>
                  $25 {translate("per copy")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8 max-w-xl mx-auto">
          {translate("All prices are in USD. Rush processing is subject to availability. Contact us for questions about pricing or custom evaluation needs.")}
        </p>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default Pricing;
