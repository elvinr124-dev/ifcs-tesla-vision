import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import AIChatWidget from "@/components/AIChatWidget";
import Index from "./pages/Index";
import Translations from "./pages/Translations";
import Evaluations from "./pages/Evaluations";
import Application from "./pages/Application";
import Consulting from "./pages/Consulting";
import BookConsultation from "./pages/BookConsultation";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ClientLogin from "./pages/ClientLogin";
import StaffLogin from "./pages/StaffLogin";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import StaffCartView from "./pages/StaffCartView";
import ForIndividuals from "./pages/ForIndividuals";
import ForInstitutions from "./pages/ForInstitutions";
import TranslationOrder from "./pages/TranslationOrder";
import TranslationQuote from "./pages/TranslationQuote";
import ClientDashboard from "./pages/ClientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import DuplicateReports from "./pages/DuplicateReports";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AddonElectronicSharing from "./pages/AddonElectronicSharing";
import AddonHardCopy from "./pages/AddonHardCopy";
import AddonDomesticShipping from "./pages/AddonDomesticShipping";
import AddonInternationalShipping from "./pages/AddonInternationalShipping";
import AddonRenewal from "./pages/AddonRenewal";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TranscriptViewer from "./pages/TranscriptViewer";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatWidget />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
