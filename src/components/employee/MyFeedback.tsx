import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  MessageSquare,
  Calendar,
  User,
  Loader2,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyObservations } from "@/hooks/useEmployee";
import { format } from "date-fns";
import type { Observation } from "@/api/types";

const MyFeedback = () => {
  const { data: observationsData, isLoading } = useMyObservations();
  const observations = observationsData?.observations || [];

  // Group feedback by category and rating
  const feedbackSummary = useMemo(() => {
    const summary = {
      total: observations.length,
      byCategory: {} as Record<string, number>,
      byRating: {} as Record<string, number>,
    };

    observations.forEach((obs: Observation) => {
      // Count by category
      if (!summary.byCategory[obs.category]) {
        summary.byCategory[obs.category] = 0;
      }
      summary.byCategory[obs.category]++;

      // Count by rating
      if (!summary.byRating[obs.rating]) {
        summary.byRating[obs.rating] = 0;
      }
      summary.byRating[obs.rating]++;
    });

    return summary;
  }, [observations]);

  // Sort observations by date (newest first)
  const sortedObservations = useMemo(() => {
    return [...observations].sort((a, b) =>
      new Date(b.observation_date).getTime() - new Date(a.observation_date).getTime()
    );
  }, [observations]);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral': return <Minus className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'positive': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'neutral': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-500/10 text-blue-500',
      communication: 'bg-purple-500/10 text-purple-500',
      leadership: 'bg-orange-500/10 text-orange-500',
      delivery: 'bg-green-500/10 text-green-500',
      quality: 'bg-indigo-500/10 text-indigo-500',
      collaboration: 'bg-pink-500/10 text-pink-500',
    };
    return colors[category as keyof typeof colors] || 'bg-muted-foreground/10 text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Feedback Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "Total Feedback",
            value: feedbackSummary.total,
            icon: MessageSquare,
            color: "text-primary",
            bgColor: "bg-primary/10"
          },
          {
            label: "Positive Reviews",
            value: feedbackSummary.byRating.positive || 0,
            icon: TrendingUp,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10"
          },
          {
            label: "Key Competencies",
            value: Object.keys(feedbackSummary.byCategory).length,
            icon: Star,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10"
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none shadow-lg shadow-black/5 dark:shadow-white/5 bg-gradient-to-tr from-card to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-foreground mt-1 tracking-tight">
                      {isLoading ? (
                        <span className="flex items-center gap-2 opacity-20">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </span>
                      ) : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feedback by Category */}
      {!isLoading && Object.keys(feedbackSummary.byCategory).length > 0 && (
        <Card className="border-border/50 bg-accent/5 overflow-hidden">
          <CardHeader className="bg-accent/10 border-b border-border/10">
            <CardTitle className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-wider text-muted-foreground">
              <Star className="h-5 w-5 text-pink-500" />
              Competency Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(feedbackSummary.byCategory).map(([category, count]) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`px-4 py-2 rounded-xl border-2 transition-all hover:scale-105 cursor-default ${getCategoryColor(category)}`}
                >
                  <span className="font-bold capitalize mr-2">{category.replace('_', ' ')}</span>
                  <span className="opacity-60 text-[10px] font-black border-l pl-2 border-current">{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback History */}
      <Card className="border-border/40 shadow-xl shadow-black/5 overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-widest text-muted-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Detailed Observations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
            </div>
          ) : sortedObservations.length === 0 ? (
            <div className="text-center py-20 bg-accent/5">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Growth Journey Starting</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Feedback from your team lead will appear here to help guide your progress and celebrate wins.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {sortedObservations.map((observation: Observation, index) => (
                <motion.div
                  key={observation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-accent/5 transition-colors relative group"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${observation.rating === 'positive' ? 'bg-emerald-500' :
                    observation.rating === 'negative' ? 'bg-destructive' : 'bg-amber-500'
                    } opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {observation.evaluator_name}
                        </p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                          {observation.evaluator_role || 'Team Lead'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className={`px-2 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${getRatingColor(observation.rating)}`}>
                        {getRatingIcon(observation.rating)}
                        {observation.rating}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {format(new Date(observation.observation_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 pl-14">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow-sm ${getCategoryColor(observation.category)}`}
                      >
                        {observation.category.replace('_', ' ')}
                      </Badge>
                      {observation.related_task_title && (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[10px] font-bold text-muted-foreground border border-border/50">
                          <CheckCircle className="h-3 w-3" />
                          TASK: {observation.related_task_title}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed font-medium bg-background/50 p-4 rounded-2xl border border-border/20 shadow-inner">
                      {observation.note}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidance */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">About Your Feedback</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Feedback is provided by your team lead to help you grow and improve</p>
                <p>• All feedback is constructive and aimed at supporting your development</p>
                <p>• You can discuss any feedback with your team lead during regular check-ins</p>
                <p>• This information is private and only visible to you and your team lead</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MyFeedback;