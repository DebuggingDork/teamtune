import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: "TeamTune transformed how we manage sprints. Our velocity increased 40% in just two months of using the platform.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sarah Chen",
    role: "Engineering Manager",
  },
  {
    text: "The workload balancing feature helped us prevent burnout before it happened. Game changer for team health.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Michael Torres",
    role: "VP of Engineering",
  },
  {
    text: "Finally, a tool that gives me real insights into team dynamics without micromanaging. Highly recommended.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Emily Watson",
    role: "Product Director",
  },
  {
    text: "We identified bottlenecks that were invisible before. TeamTune's analytics are incredibly actionable.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "David Kim",
    role: "CTO",
  },
  {
    text: "The sprint analytics helped us improve our estimation accuracy by 60%. Data-driven decisions made easy.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Jessica Park",
    role: "Scrum Master",
  },
  {
    text: "Team engagement scores gave us early warning signs. We've never had better retention since using TeamTune.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Amanda Foster",
    role: "HR Director",
  },
  {
    text: "Integration was seamless. Within a week, we had insights that took us months to gather manually before.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Ryan Mitchell",
    role: "Tech Lead",
  },
  {
    text: "The real-time dashboards keep stakeholders informed without constant status meetings. Huge time saver.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Lisa Zhang",
    role: "Project Manager",
  },
  {
    text: "Best investment we made this year. ROI was visible within the first month of deployment.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "James Wilson",
    role: "CEO",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = ({
  className,
  testimonials,
  duration = 10,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 list-none m-0 p-0"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <motion.li
                key={`${index}-${i}`}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                className="p-6 rounded-2xl border border-border bg-card max-w-xs w-full transition-all duration-300 cursor-default select-none group"
              >
                <blockquote className="m-0 p-0">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    "{text}"
                  </p>
                  <footer className="flex items-center gap-3 mt-4">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={`Avatar of ${name}`}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300"
                    />
                    <div className="flex flex-col">
                      <cite className="font-semibold not-italic text-sm text-foreground">
                        {name}
                      </cite>
                      <span className="text-xs text-muted-foreground">
                        {role}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto px-4"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent rounded-full text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-6">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-foreground mb-4">
            Loved by teams{" "}
            <span className="text-muted-foreground">everywhere</span>
          </h2>
          <p className="text-center text-lg text-muted-foreground">
            See how teams are transforming their performance with TeamTune.
          </p>
        </div>

        {/* Testimonials Columns */}
        <div
          className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
