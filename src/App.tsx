import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout";
import Report from "./pages/Report";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlog from "./pages/AdminBlog";
import AdminCustomerSync from "./pages/AdminCustomerSync";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Sitemap from "./pages/Sitemap";
import FaviconGenerator from "./pages/FaviconGenerator";
import NotFound from "./pages/NotFound";
import PreviewResult from "./pages/PreviewResult";
import CheckoutNew from "./pages/CheckoutNew";
import PaidReport from "./pages/PaidReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/preview" element={<PreviewResult />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-new" element={<CheckoutNew />} />
          <Route path="/paid-report" element={<PaidReport />} />
          <Route path="/report" element={<Report />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/customer-sync" element={<AdminCustomerSync />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/generate-favicon" element={<FaviconGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
