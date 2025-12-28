
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";

// Auth pages
import RoleSelection from "./pages/auth/RoleSelection";
import AdminLogin from "./pages/auth/AdminLogin";
import ProjectManagerLogin from "./pages/auth/ProjectManagerLogin";
import TeamLeadLogin from "./pages/auth/TeamLeadLogin";
import MemberLogin from "./pages/auth/MemberLogin";
import EmployeeSignUp from "./pages/auth/EmployeeSignUp";
import PendingApproval from "./pages/auth/PendingApproval";

// Dashboard pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProjectManagerDashboard from "./pages/dashboard/ProjectManagerDashboard";
import TeamLeadDashboard from "./pages/dashboard/TeamLeadDashboard";
import MemberDashboard from "./pages/dashboard/MemberDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Auth routes */}
          <Route path="/auth" element={<RoleSelection />} />
          <Route path="/auth/admin" element={<AdminLogin />} />
          <Route path="/auth/project-manager" element={<ProjectManagerLogin />} />
          <Route path="/auth/team-lead" element={<TeamLeadLogin />} />
          <Route path="/auth/member" element={<MemberLogin />} />
          <Route path="/auth/signup" element={<EmployeeSignUp />} />
          <Route path="/auth/pending-approval" element={<PendingApproval />} />

          {/* Dashboard routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/project-manager" element={<ProjectManagerDashboard />} />
          <Route path="/dashboard/team-lead" element={<TeamLeadDashboard />} />
          <Route path="/dashboard/member" element={<MemberDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
