import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TeamTuneLogo from "./TeamTuneLogo";

const FloatingCard = ({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className={className}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg"
    >
      {children}
    </motion.div>
  </motion.div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--muted))_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      {/* Floating UI Cards - Left Side */}
      <FloatingCard className="absolute left-[5%] top-[20%] hidden lg:block" delay={0.2}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Team Velocity</p>
            <p className="text-sm font-semibold text-foreground">+23% this sprint</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="absolute left-[8%] bottom-[30%] hidden lg:block" delay={0.4}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Members</p>
            <p className="text-sm font-semibold text-foreground">24 online</p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating UI Cards - Right Side */}
      <FloatingCard className="absolute right-[5%] top-[25%] hidden lg:block" delay={0.3}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Productivity</p>
            <p className="text-sm font-semibold text-foreground">92% optimal</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="absolute right-[10%] bottom-[35%] hidden lg:block" delay={0.5}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sprint Health</p>
            <p className="text-sm font-semibold text-foreground">On track</p>
          </div>
        </div>
      </FloatingCard>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        {/* Logo Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="p-4 bg-card border border-border rounded-2xl shadow-lg">
            <TeamTuneLogo showText={false} className="h-10" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
        >
          Your Team's Performance,{" "}
          <span className="text-muted-foreground">Perfectly Tuned</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Analyze team performance, identify actionable insights, and drive maximum
          productivity with intelligent metrics that matter.
        </motion.p>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {String.fromCharCode(64 + i)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">2,500+</span> teams optimized
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth/signup">
            <Button size="lg" className="rounded-full px-8 gap-2 group">
              Get Started for Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
