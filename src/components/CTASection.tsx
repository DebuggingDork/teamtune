import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { BackgroundBeams } from "@/components/ui/background-beams";

const CTASection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitted(true);
    toast({
      title: "You're on the list!",
      description: "We'll notify you when TeamTune is ready.",
    });
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 border border-white/20 dark:border-gray-800/50 shadow-2xl min-h-[500px] flex flex-col items-center justify-center p-8 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/10 pointer-events-none" />
            <BackgroundBeams className="opacity-60 dark:opacity-30" />

            <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Limited Early Access
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 mb-6 font-sans drop-shadow-sm">
                Ready to <span className="text-[#3ca2fa] dark:text-blue-400">tune</span> your team?
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of high-performing teams using TeamTune to unlock their full potential.
                Get real-time analytics for your workflow.
              </p>

              {!isSubmitted ? (
                <>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full relative">
                    <div className="flex-1 relative group">
                      <Input
                        type="email"
                        placeholder="Enter your work email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 rounded-full px-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#3ca2fa]/20 dark:focus-visible:ring-blue-500/30 focus-visible:border-[#3ca2fa] dark:focus-visible:border-blue-400 transition-all shadow-sm group-hover:shadow-md"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-14 rounded-full px-10 gap-2 bg-[#0a0a0a] dark:bg-[#3ca2fa] text-white hover:bg-[#3ca2fa] dark:hover:bg-blue-500 shadow-xl hover:shadow-[#3ca2fa]/25 dark:hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 font-medium text-base"
                    >
                      Join Waitlist / Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      className="text-muted-foreground"
                      onClick={() => navigate("/login")}
                      type="button"
                    >
                      Already have an account? Sign in
                    </Button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 bg-green-50/80 dark:bg-green-950/50 backdrop-blur-sm border border-green-100 dark:border-green-900/50 px-8 py-6 rounded-2xl shadow-sm"
                >
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">You're on the list!</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">We'll notify you as soon as spots open up.</p>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-6 mt-10 text-xs font-medium text-gray-400 dark:text-gray-500 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <span>Trusted by innovators at</span>
                <div className="flex gap-4">
                  <span>ACME Inc.</span>
                  <span>Globex</span>
                  <span>Soylent Corp</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
