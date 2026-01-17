
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
import About from "./pages/About";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
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
import TimeApprovalPage from "./pages/dashboard/team-lead/TimeApprovalPage";
import TeamManagementPage from "./pages/dashboard/team-lead/TeamManagementPage";
import SprintManagementPage from "./pages/dashboard/team-lead/SprintManagementPage";
import CommunicationsPage from "./pages/dashboard/team-lead/CommunicationsPage";
import TeamLeadProfilePage from "./pages/dashboard/team-lead/ProfilePage";
import TeamLeadGithubPage from "./pages/dashboard/team-lead/GithubPage";

// Member pages
import MemberTasksPage from "./pages/dashboard/member/TasksPage";
import TimeTrackingPage from "./pages/dashboard/member/TimeTrackingPage";
import MemberProfilePage from "./pages/dashboard/member/ProfilePage";
import MemberGithubPage from "./pages/dashboard/member/GithubPage";

// Admin pages
import AdminSettingsPage from "./pages/dashboard/admin/SettingsPage";
import PluginsPage from "./pages/dashboard/admin/PluginsPage";
import AdminProjectsPage from "./pages/dashboard/admin/ProjectsPage";
import AdminProjectDetailPage from "./pages/dashboard/admin/ProjectDetailPage";
import AdminProfilePage from "./pages/dashboard/admin/ProfilePage";
import UsersPage from "./pages/dashboard/admin/UsersPage";
import RolesPage from "./pages/dashboard/admin/RolesPage";

// GitHub OAuth callback
import GitHubCallbackPage from "./pages/GitHubCallbackPage";

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
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />

                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/signup" element={<EmployeeSignUp />} />
                <Route path="/auth/pending-approval" element={<PendingApproval />} />

                {/* GitHub OAuth callback routes */}
                <Route path="/admin/plugins" element={<GitHubCallbackPage />} />
                <Route path="/employee/github" element={<GitHubCallbackPage />} />
                <Route path="/team-lead/github" element={<GitHubCallbackPage />} />

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
                  path="/dashboard/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin/roles"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <RolesPage />
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
                  path="/dashboard/team-lead/time-approval"
                  element={
                    <ProtectedRoute requiredRole="team_lead">
                      <TimeApprovalPage />
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
                  path="/dashboard/team-lead/sprints"
                  element={
                    <ProtectedRoute requiredRole="team_lead">
                      <SprintManagementPage />
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
                  path="/dashboard/team-lead/communications"
                  element={
                    <ProtectedRoute requiredRole="team_lead">
                      <CommunicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/team-lead/github"
                  element={
                    <ProtectedRoute requiredRole="team_lead">
                      <TeamLeadGithubPage />
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
                  path="/dashboard/member"
                  element={
                    <ProtectedRoute requiredRole="employee">
                      <MemberDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/member/progress"
                  element={
                    <ProtectedRoute requiredRole="employee">
                      <MemberDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/member/feedback"
                  element={
                    <ProtectedRoute requiredRole="employee">
                      <MemberDashboard />
                    </ProtectedRoute>
                  }
                />
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
                <Route
                  path="/dashboard/member/github"
                  element={
                    <ProtectedRoute requiredRole="employee">
                      <MemberGithubPage />
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
