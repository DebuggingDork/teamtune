import { motion } from "framer-motion";
import { ArrowRight, Users, BarChart3, Target, Shield, Zap, CheckCircle, TrendingUp, Activity, Clock, MessageSquare, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamTuneLogo from "@/components/TeamTuneLogo";

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Organize teams, assign roles, and manage permissions with granular control over access levels."
    },
    {
      icon: Target,
      title: "Project Tracking",
      description: "Monitor project progress, set milestones, and track deliverables with real-time updates."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Get detailed insights into team performance, productivity metrics, and project success rates."
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Track time spent on tasks, manage schedules, and optimize resource allocation."
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Centralized communication with integrated messaging, notifications, and feedback systems."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control and audit trails."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Setup Your Organization",
      description: "Create your organization account and invite team members. Set up departments, roles, and permissions.",
      icon: Settings
    },
    {
      step: "02",
      title: "Create Projects & Teams",
      description: "Organize your work into projects, assign team members, and define project goals and timelines.",
      icon: Users
    },
    {
      step: "03",
      title: "Track Progress",
      description: "Monitor real-time progress, track tasks, and get insights into team performance and productivity.",
      icon: TrendingUp
    },
    {
      step: "04",
      title: "Analyze & Optimize",
      description: "Use analytics to identify bottlenecks, optimize workflows, and improve team efficiency.",
      icon: BarChart3
    }
  ];

  const benefits = [
    "Increase team productivity by up to 40%",
    "Reduce project delivery time by 25%",
    "Improve team communication and collaboration",
    "Get real-time visibility into project status",
    "Make data-driven decisions with analytics",
    "Ensure compliance and security standards"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <TeamTuneLogo showText={false} />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                TeamTune
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The complete team management platform that harmonizes your workforce, 
              streamlines projects, and amplifies productivity through intelligent insights.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Organizations" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "40%", label: "Productivity Boost" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How TeamTune Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed to be intuitive and powerful, helping you manage teams 
              and projects with ease while providing deep insights into performance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{item.step}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage teams, track projects, and boost productivity 
              in one comprehensive platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 h-full hover:border-primary/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeInUp}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why Choose TeamTune?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                TeamTune isn't just another project management tool. It's a comprehensive 
                platform designed to transform how teams work together, providing the 
                insights and tools needed to achieve exceptional results.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 backdrop-blur-sm border border-border/50">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Activity, label: "Real-time Analytics", value: "24/7" },
                    { icon: Zap, label: "Performance Boost", value: "+40%" },
                    { icon: Shield, label: "Security Level", value: "Enterprise" },
                    { icon: TrendingUp, label: "Success Rate", value: "98%" }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 bg-card/50 rounded-xl backdrop-blur-sm">
                      <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            {...fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Join thousands of organizations that have already revolutionized their 
              team management with TeamTune. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;