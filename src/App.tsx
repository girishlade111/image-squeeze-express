import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import { RouteSkeleton } from "@/components/Skeleton";
import { prefetchOnIdle } from "@/lib/prefetch";

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CompressPdf = lazy(() => import("./pages/CompressPdf"));
const BulkRename = lazy(() => import("./pages/BulkRename"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const loadAbout = () => import("./pages/About");
const loadCompressPdf = () => import("./pages/CompressPdf");
const loadBulkRename = () => import("./pages/BulkRename");
const loadContact = () => import("./pages/Contact");
const loadPrivacy = () => import("./pages/PrivacyPolicy");
const loadTerms = () => import("./pages/TermsOfService");

const App = () => {
  useEffect(() => {
    prefetchOnIdle([
      loadCompressPdf,
      loadBulkRename,
      loadAbout,
      loadContact,
      loadPrivacy,
      loadTerms,
    ]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteSkeleton />}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/compress-pdf" element={<CompressPdf />} />
                  <Route path="/bulk-rename" element={<BulkRename />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
            <Analytics />
            <SpeedInsights />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
