
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
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
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import TimelinePage from "./pages/dashboard/TimelinePage";
import ProjectDetail from "./pages/dashboard/ProjectDetail";
import TeamLeadDashboard from "./pages/dashboard/TeamLeadDashboard";
import MemberDashboard from "./pages/dashboard/MemberDashboard";

// Team Lead pages
import TasksPage from "./pages/dashboard/team-lead/TasksPage";
import FeedbackPage from "./pages/dashboard/team-lead/FeedbackPage";
import TeamManagementPage from "./pages/dashboard/team-lead/TeamManagementPage";
import TeamLeadProfilePage from "./pages/dashboard/team-lead/ProfilePage";

// Member pages
import MemberTasksPage from "./pages/dashboard/member/TasksPage";
import TimeTrackingPage from "./pages/dashboard/member/TimeTrackingPage";
import MemberProfilePage from "./pages/dashboard/member/ProfilePage";

// Admin pages
import AdminSettingsPage from "./pages/dashboard/admin/SettingsPage";
import PluginsPage from "./pages/dashboard/admin/PluginsPage";
import AdminProjectsPage from "./pages/dashboard/admin/ProjectsPage";
import AdminProjectDetailPage from "./pages/dashboard/admin/ProjectDetailPage";
import AdminProfilePage from "./pages/dashboard/admin/ProfilePage";

// Project Manager pages
import ProjectManagerProfilePage from "./pages/dashboard/project-manager/ProfilePage";
import ReportsPage from "./pages/dashboard/project-manager/ReportsPage";

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Component to clean up URL hash
const HashCleaner = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove any hash from URL
    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [location]);

  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <HashCleaner />
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

            {/* Dashboard routes - Protected */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/project-manager"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/project-manager/projects"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/project-manager/timeline"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <TimelinePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/project-manager/projects/:projectCode"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team-lead"
              element={
                <ProtectedRoute requiredRole="team_lead">
                  <TeamLeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/member"
              element={
                <ProtectedRoute requiredRole="employee">
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />

            {/* Team Lead Routes */}
            <Route
              path="/dashboard/team-lead/tasks"
              element={
                <ProtectedRoute requiredRole="team_lead">
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team-lead/feedback"
              element={
                <ProtectedRoute requiredRole="team_lead">
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team-lead/team"
              element={
                <ProtectedRoute requiredRole="team_lead">
                  <TeamManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/team-lead/profile"
              element={
                <ProtectedRoute requiredRole="team_lead">
                  <TeamLeadProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Employee/Member Routes */}
            <Route
              path="/dashboard/member/tasks"
              element={
                <ProtectedRoute requiredRole="employee">
                  <MemberTasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/member/time-tracking"
              element={
                <ProtectedRoute requiredRole="employee">
                  <TimeTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/member/profile"
              element={
                <ProtectedRoute requiredRole="employee">
                  <MemberProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/dashboard/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/plugins"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PluginsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/projects/:projectId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjectDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Redirect old departments route to projects */}
            <Route
              path="/dashboard/admin/departments"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Navigate to="/dashboard/admin/projects" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Project Manager Routes */}
            <Route
              path="/dashboard/project-manager/profile"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectManagerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/project-manager/reports"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
