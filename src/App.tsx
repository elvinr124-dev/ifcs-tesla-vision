import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Translations from "./pages/Translations";
import Evaluations from "./pages/Evaluations";
import Application from "./pages/Application";
import Consulting from "./pages/Consulting";
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
