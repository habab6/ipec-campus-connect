import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import StudentRegistration from "./pages/StudentRegistration";
import StudentList from "./pages/StudentList";
import StudentEdit from "./pages/StudentEdit";
import PaymentManagement from "./pages/PaymentManagement";
import DocumentGeneration from "./pages/DocumentGeneration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<StudentRegistration />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/edit-student/:id" element={<StudentEdit />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/documents/:studentId" element={<DocumentGeneration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
