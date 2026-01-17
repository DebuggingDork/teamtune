import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GitHubGlassCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    gradient?: boolean | string;
    title?: string;
    icon?: ReactNode;
}

export function GitHubGlassCard({ children, className, delay = 0, gradient = false, title, icon }: GitHubGlassCardProps) {
    const hasGradient = !!gradient;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="h-full"
        >
            <Card className={cn(
                "relative h-full overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:border-primary/30 group",
                hasGradient && "bg-gradient-to-br from-background/80 via-background/40 to-primary/5",
                className
            )}>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-700" />

                <div className="relative z-10 p-6 h-full flex flex-col">
                    {(title || icon) && (
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {icon && <span className="text-primary">{icon}</span>}
                                {title}
                            </h2>
                        </div>
                    )}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
