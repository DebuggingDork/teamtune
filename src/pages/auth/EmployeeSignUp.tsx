import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, Calendar, Clock, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TeamTuneLogo from "@/components/TeamTuneLogo";
import { useToast } from "@/hooks/use-toast";
import * as authService from "@/services/auth.service";
import { handleError } from "@/utils/errorHandler";
import loginHero from "@/assets/login-hero.jpg";

const EmployeeSignUp = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !username || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    // Basic client-side validation (server will do full validation)
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters with uppercase, lowercase, and number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email: email.trim(),
        password: password.trim(),
        username: username.trim(),
        full_name: fullName.trim(),
      });
      
      toast({
        title: "Registration successful",
        description: "Your account request has been submitted. Awaiting admin approval.",
      });
      
      navigate("/auth/pending-approval");
    } catch (error) {
      // Log error for debugging
      console.log('Registration error:', error);
      // Don't pass custom message - let the actual API error message show
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 bg-card">
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
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Notice Banner */}
            <div className="bg-accent/50 border border-border rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Employee Access Only</p>
                <p className="text-muted-foreground">
                  This sign-up is exclusively for employees. Your account will require admin approval before you can access the system.
                </p>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Request Access</h1>
              <p className="text-muted-foreground">Create your employee account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background pr-10"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting request...
                  </>
                ) : (
                  "Submit Access Request"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Image with Floating Cards */}
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
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

          {/* Floating Cards */}
          <div className="relative h-full p-8 flex flex-col justify-between">
            {/* Top Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="self-end bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Task Review With Team</p>
                  <p className="text-xs text-muted-foreground">09:30am - 10:00am</p>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </motion.div>

            {/* Bottom Section */}
            <div className="space-y-4">
              {/* Week Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-primary/80 backdrop-blur-sm rounded-xl p-4 max-w-xs"
              >
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-primary-foreground/70">{day}</div>
                  ))}
                  {[22, 23, 24, 25, 26, 27, 28].map((date) => (
                    <div
                      key={date}
                      className={`py-1 rounded-lg text-primary-foreground ${
                        date === 24 ? 'bg-card text-foreground font-semibold' : ''
                      }`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Meeting Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Daily Meeting</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>12:00pm - 01:00pm</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-accent border-2 border-card flex items-center justify-center"
                      >
                        <Users className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">+2 more</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeSignUp;
