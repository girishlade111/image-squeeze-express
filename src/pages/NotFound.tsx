import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 pt-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            <AlertTriangle className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight">404</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            <code className="rounded bg-secondary px-1.5 py-0.5">{location.pathname}</code>
          </p>
          <Button asChild className="mt-6 rounded-full px-5">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </a>
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
