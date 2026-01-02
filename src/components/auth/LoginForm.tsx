import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, Calendar, Clock, Users, Sparkles, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import loginHero from "@/assets/login-hero.jpg";

interface LoginFormProps {
  role?: string;
  roleTitle?: string;
  roleIcon?: React.ReactNode;
  dashboardPath?: string;
}

const LoginForm = ({ dashboardPath }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: loginAuth } = useAuth();

  // Map user roles to dashboard paths
  const getDashboardPath = (userRole: string): string => {
    const roleDashboardMap: Record<string, string> = {
      admin: '/dashboard/admin',
      project_manager: '/dashboard/project-manager',
      team_lead: '/dashboard/team-lead',
      employee: '/dashboard/member',
    };
    return roleDashboardMap[userRole] || '/dashboard/member';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim whitespace from email and password
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Login and get user directly from response
      const loggedInUser = await loginAuth(trimmedEmail, trimmedPassword);

      // Use provided dashboardPath or determine from user role
      const targetPath = dashboardPath || (loggedInUser ? getDashboardPath(loggedInUser.role) : '/dashboard/member');

      toast({
        title: "Welcome back!",
        description: `Signed in successfully`,
      });

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to dashboard (replace to avoid adding to history and prevent hash)
      navigate(targetPath, { replace: true });
    } catch (error: any) {
      // Extract error message from various possible structures
      let errorMessage = '';

      // Debug: Log error structure in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Login error structure:', {
          error,
          errorMessage: error?.message,
          errorError: error?.error,
          responseData: error?.response?.data,
        });
      }

      // Check all possible error structures (in order of likelihood)
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      const lowerErrorMessage = errorMessage.toLowerCase();

      // Check if the error is about blocked/disabled account
      const isBlockedAccount =
        lowerErrorMessage.includes('blocked') ||
        lowerErrorMessage.includes('account has been blocked') ||
        lowerErrorMessage.includes('account disabled') ||
        lowerErrorMessage.includes('disabled') ||
        (error?.error?.code === 'UNAUTHORIZED' && lowerErrorMessage.includes('disabled')) ||
        (error?.status === 401 && lowerErrorMessage.includes('disabled'));

      if (isBlockedAccount) {
        toast({
          title: "Account Blocked",
          description: "Your account has been blocked. Please contact your administrator for assistance.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage || "Please check your credentials and try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <TeamTuneLogo />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-md relative"
            >
              {/* Glassmorphism Card */}
              <div className="relative">
                {/* Card Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-50" />
                
                {/* Main Card */}
                <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
                  {/* Welcome Text */}
                  <div className="mb-8 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center gap-2 mb-4"
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                      <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
                    </motion.div>
                    <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 backdrop-blur-sm"
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none opacity-0 transition-opacity focus-within:opacity-100" />
                      </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                        <Link
                          to="/auth/forgot-password"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 backdrop-blur-sm pr-10"
                          autoComplete="current-password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-accent"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none opacity-0 transition-opacity focus-within:opacity-100" />
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02]" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Sign in
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Footer Links */}
                  <div className="text-center space-y-3 mt-8">
                    <p className="text-sm text-muted-foreground">
                      New user?{" "}
                      <Link to="/auth/signup" className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                        Register here
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Need help?{" "}
                      <a href="mailto:support@teamtune.io" className="text-primary hover:text-primary/80 hover:underline transition-colors">
                        Contact support
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Enhanced Visual */}
        <div className="hidden lg:flex lg:w-1/2 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full rounded-3xl overflow-hidden"
          >
            {/* Background Image */}
            <img
              src={loginHero}
              alt="Team collaboration"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Enhanced Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-accent/20" />
            <div className="absolute inset-0 bg-background/20" />

            {/* Floating Cards with Enhanced Glassmorphism */}
            <div className="relative h-full p-8 flex flex-col justify-between">
              {/* Top Card - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="self-end bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm border border-border/30">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Task Review With Team</p>
                    <p className="text-xs text-muted-foreground">09:30am - 10:00am</p>
                  </div>
                  <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                </div>
              </motion.div>

              {/* Bottom Section - Enhanced */}
              <div className="space-y-6">
                {/* Analytics Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-border/50 rounded-2xl p-5 max-w-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Team Performance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">94%</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">8.2</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">15</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>
                </motion.div>

                {/* Meeting Card - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl max-w-xs"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Daily Standup</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>12:00pm - 01:00pm</span>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-accent/30 backdrop-blur-sm border-2 border-border/50 flex items-center justify-center"
                        >
                          <Users className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 font-medium">+2 more</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;