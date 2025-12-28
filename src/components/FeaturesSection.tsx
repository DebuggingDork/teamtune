import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity,
  MessageSquare,
  Timer,
  Scale,
  Heart
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive visual dashboards that surface key metrics and trends across your entire team.",
  },
  {
    icon: Users,
    title: "Team Insights",
    description: "Deep understanding of team dynamics, collaboration patterns, and individual contributions.",
  },
  {
    icon: TrendingUp,
    title: "Performance Metrics",
    description: "Track velocity, throughput, and efficiency with automated performance measurements.",
  },
  {
    icon: Activity,
    title: "Productivity Tracking",
    description: "Monitor work patterns and identify bottlenecks to optimize team output.",
  },
  {
    icon: MessageSquare,
    title: "Team Collaboration",
    description: "Measure and improve cross-functional collaboration and communication effectiveness.",
  },
  {
    icon: Timer,
    title: "Sprint Analytics",
    description: "Detailed sprint breakdowns with burndown charts, velocity trends, and scope analysis.",
  },
  {
    icon: Scale,
    title: "Workload Balance",
    description: "Ensure fair distribution of work and prevent burnout with intelligent load balancing.",
  },
  {
    icon: Heart,
    title: "Engagement Scores",
    description: "Gauge team morale and engagement levels to maintain a healthy, motivated team.",
  },
];

const FeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all duration-300"
  >
    <div className="p-3 bg-accent rounded-xl w-fit mb-4 group-hover:bg-primary/10 transition-colors">
      <feature.icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-background" id="product">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent rounded-full text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-6">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Everything you need to{" "}
            <span className="text-muted-foreground">optimize your team</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools to analyze, track, and improve team performance at every level.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
