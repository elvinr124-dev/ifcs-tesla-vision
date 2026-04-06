import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import AIChatWidget from "@/components/AIChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";

// Eager-load homepage for fast initial render
import Index from "./pages/Index";

// Lazy-load all other pages
const Translations = lazy(() => import("./pages/Translations"));
const Evaluations = lazy(() => import("./pages/Evaluations"));
const Application = lazy(() => import("./pages/Application"));
const Consulting = lazy(() => import("./pages/Consulting"));
const BookConsultation = lazy(() => import("./pages/BookConsultation"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const Signup = lazy(() => import("./pages/Signup"));
const Cart = lazy(() => import("./pages/Cart"));
const StaffCartView = lazy(() => import("./pages/StaffCartView"));
const ForIndividuals = lazy(() => import("./pages/ForIndividuals"));
const ForInstitutions = lazy(() => import("./pages/ForInstitutions"));
const TranslationOrder = lazy(() => import("./pages/TranslationOrder"));
const TranslationQuote = lazy(() => import("./pages/TranslationQuote"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const DuplicateReports = lazy(() => import("./pages/DuplicateReports"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AddonElectronicSharing = lazy(() => import("./pages/AddonElectronicSharing"));
const AddonHardCopy = lazy(() => import("./pages/AddonHardCopy"));
const AddonDomesticShipping = lazy(() => import("./pages/AddonDomesticShipping"));
const AddonInternationalShipping = lazy(() => import("./pages/AddonInternationalShipping"));
const AddonRenewal = lazy(() => import("./pages/AddonRenewal"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TranscriptViewer = lazy(() => import("./pages/TranscriptViewer"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Account = lazy(() => import("./pages/Account"));
const Payment = lazy(() => import("./pages/Payment"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const LearnMoreEvaluations = lazy(() => import("./pages/LearnMoreEvaluations"));
const CUNY = lazy(() => import("./pages/CUNY"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/translations" element={<Translations />} />
                <Route path="/evaluations" element={<Evaluations />} />
                <Route path="/application" element={<Application />} />
                <Route path="/consulting" element={<Consulting />} />
                <Route path="/consulting/book" element={<BookConsultation />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/client" element={<ClientLogin />} />
                <Route path="/login/staff" element={<StaffLogin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/staff/cart" element={<StaffCartView />} />
                <Route path="/for-individuals" element={<ForIndividuals />} />
                <Route path="/for-institutions" element={<ForInstitutions />} />
                <Route path="/translations/order" element={<TranslationOrder />} />
                <Route path="/translations/quote" element={<TranslationQuote />} />
                <Route path="/dashboard/client" element={<ClientDashboard />} />
                <Route path="/dashboard/staff" element={<StaffDashboard />} />
                <Route path="/duplicate-reports" element={<DuplicateReports />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/addon/electronic-sharing" element={<AddonElectronicSharing />} />
                <Route path="/addon/hard-copy" element={<AddonHardCopy />} />
                <Route path="/addon/domestic-shipping" element={<AddonDomesticShipping />} />
                <Route path="/addon/international-shipping" element={<AddonInternationalShipping />} />
                <Route path="/addon/renewal" element={<AddonRenewal />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/transcript" element={<TranscriptViewer />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/account" element={<Account />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/learn-more-evaluations" element={<LearnMoreEvaluations />} />
                <Route path="/cuny" element={<CUNY />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <AIChatWidget />
              <CookieConsent />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
