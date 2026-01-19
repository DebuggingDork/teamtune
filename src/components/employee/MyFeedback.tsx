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
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyObservations } from "@/hooks/useEmployee";
import { format } from "date-fns";
import type { Observation } from "@/api/types/index";

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
      className="space-y-8"
    >
      {/* Feedback Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Total Feedback</p>
              <div className="p-3 rounded-xl backdrop-blur-sm border border-white/10 bg-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : feedbackSummary.total}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Positive</p>
              <div className="p-3 rounded-xl backdrop-blur-sm border border-white/10 bg-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : feedbackSummary.byRating.positive || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Categories</p>
              <div className="p-3 rounded-xl backdrop-blur-sm border border-white/10 bg-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : Object.keys(feedbackSummary.byCategory).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback by Category */}
      {!isLoading && Object.keys(feedbackSummary.byCategory).length > 0 && (
        <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                <Star className="h-5 w-5 text-primary" />
              </div>
              Feedback by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(feedbackSummary.byCategory).map(([category, count]) => (
                <div key={category} className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-white/10 backdrop-blur-sm">
                      {count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback History */}
      <Card className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl hover:bg-background/50 transition-all duration-500 group">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/20 group-hover:bg-primary/30 transition-all duration-300">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Feedback History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedObservations.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl inline-block mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No feedback yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your team lead hasn't provided any feedback yet. Feedback will appear here when available.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedObservations.map((observation: Observation, index) => (
                <motion.div
                  key={observation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300 ${getRatingColor(observation.rating)}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/20 backdrop-blur-sm border border-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {observation.evaluator_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {observation.evaluator_role || 'Team Lead'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg backdrop-blur-sm border border-white/10">
                        {getRatingIcon(observation.rating)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(observation.observation_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs bg-white/10 backdrop-blur-sm ${getCategoryColor(observation.category)}`}
                      >
                        {observation.category.replace('_', ' ')}
                      </Badge>
                      {observation.related_task_title && (
                        <Badge variant="outline" className="text-xs bg-white/10 backdrop-blur-sm">
                          Task: {observation.related_task_title}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed">
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
      <Card className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 shadow-2xl hover:shadow-3xl hover:bg-blue-500/15 transition-all duration-500 group">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-300">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">About Your Feedback</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p>• Feedback is provided by your team lead to help you grow and improve</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p>• All feedback is constructive and aimed at supporting your development</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p>• You can discuss any feedback with your team lead during regular check-ins</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p>• This information is private and only visible to you and your team lead</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MyFeedback;