import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { ArrowLeft } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Legal</p>
          <h1 className="tesla-hero-title text-white">Terms of Service</h1>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-8 md:p-12 prose prose-sm max-w-none text-foreground">
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Terms and Conditions</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">I agree to the following terms and conditions:</p>
              
              <ol className="space-y-4 text-sm text-foreground/90 leading-relaxed list-decimal pl-5">
                <li>I certify that the information provided in this application is true and correct.</li>
                <li>No evaluation will be prepared and no refunds will be issued if IFCS determines that your documents have been in any way altered, tampered or forged. Furthermore, all relevant institutions listed on the application will be notified of the forged documentation submitted to IFCS.</li>
                <li>Payment must be made in U.S. dollars by money order, check, cash, Visa or MasterCard. If the money order or check is issued by a bank outside of the U.S., it must contain the printed name of the U.S. bank with which the bank is affiliated. A $40 fee will be charged for all returned checks. All fees are subject to change without notice.</li>
                <li>Refunds will be made only if an applicant has overpaid for services to IFCS. Applications for 8-10 day service can only be cancelled within 24hr of submission and will be subject to a $50 minimum processing fee. No refunds can be issued for 24hr, and 3-day service.</li>
                <li>Institute of Foreign Credential Services reserves the right to refuse service to anyone for any reason.</li>
                <li>Institute of Foreign Credential Services reserves the right to request additional information and/or official documentation by the issuing institution during the application process. Additionally, IFCS reserves the right to contact the issuing institution and authenticate your educational credentials.</li>
                <li>Two copies of each evaluation are included with the regular evaluation fee. You will need to pay for shipping: Additional copies may be requested for $25 each, plus shipping.</li>
                <li>My evaluation and/or translation will be completed entirely based on the documents I submit to IFCS.</li>
                <li>I release IFCS from any liability for damages resulting from the use of an evaluation or translation by me or third party.</li>
                <li>Evaluation reports can only be released once we have received official documents directly from the issuing institution(s), or confirmation of your studies, if you had selected our verification service.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
