import React, { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { navItems } from "./nav-items";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import SkipToContent from "./components/SkipToContent";
import { testNeo4jConnection } from "./services/neo4jService";
import { toast } from 'sonner';

const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    testNeo4jConnection()
      .then((isConnected) => {
        if (isConnected) {
          console.log('Successfully connected to Neo4j');
        } else {
          console.error('Failed to connect to Neo4j');
          toast.error('Failed to connect to Neo4j. Some features may not work properly.');
        }
      })
      .catch((error) => {
        console.error('Error testing Neo4j connection:', error);
        toast.error('Error connecting to Neo4j. Please try again later.');
      });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <HelmetProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <SkipToContent />
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<Layout />}>
                      {navItems.map(({ to, page }) => (
                        <Route key={to} path={to} element={page} />
                      ))}
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </HelmetProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;