import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitReview } from '@/hooks/useGithub';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PRReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamCode: string;
    prNumber: number;
    prTitle: string;
}

export function PRReviewModal({ open, onOpenChange, teamCode, prNumber, prTitle }: PRReviewModalProps) {
    const [reviewState, setReviewState] = useState<'approved' | 'changes_requested' | 'commented'>('commented');
    const [comment, setComment] = useState('');
    const mutation = useSubmitReview();

    const handleSubmit = async () => {
        try {
            await mutation.mutateAsync({
                teamCode,
                prNumber,
                data: {
                    state: reviewState,
                    body: comment
                }
            });
            toast({
                title: 'Review Submitted',
                description: `Successfully ${reviewState.replace('_', ' ')} PR #${prNumber}.`,
            });
            onOpenChange(false);
            setComment('');
            setReviewState('commented');
        } catch (error: any) {
            toast({
                title: 'Review Failed',
                description: error?.response?.data?.message || 'Failed to submit review.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-widest text-primary/70">PR Review</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">Review Pull Request #{prNumber}</DialogTitle>
                    <DialogDescription className="text-base">
                        {prTitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Review Comment</Label>
                        <Textarea
                            placeholder="Share your feedback, suggestions, or praise... (Markdown supported)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[180px] bg-background/50 border-border/50 focus:ring-primary/20 resize-none transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">Review Decision</Label>
                        <RadioGroup
                            value={reviewState}
                            onValueChange={(v: any) => setReviewState(v)}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3"
                        >
                            <Label
                                htmlFor="commented"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${reviewState === 'commented'
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/60'
                                    }`}
                            >
                                <RadioGroupItem value="commented" id="commented" className="sr-only" />
                                <MessageSquare className={`h-6 w-6 mb-2 ${reviewState === 'commented' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-bold">Comment</span>
                                <span className="text-[10px] text-muted-foreground text-center mt-1">General feedback</span>
                            </Label>

                            <Label
                                htmlFor="changes_requested"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${reviewState === 'changes_requested'
                                        ? 'border-destructive bg-destructive/5 shadow-md'
                                        : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/60'
                                    }`}
                            >
                                <RadioGroupItem value="changes_requested" id="changes_requested" className="sr-only" />
                                <AlertCircle className={`h-6 w-6 mb-2 ${reviewState === 'changes_requested' ? 'text-destructive' : 'text-muted-foreground'}`} />
                                <span className="font-bold">Changes</span>
                                <span className="text-[10px] text-muted-foreground text-center mt-1">Needs attention</span>
                            </Label>

                            <Label
                                htmlFor="approved"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${reviewState === 'approved'
                                        ? 'border-green-500 bg-green-500/5 shadow-md'
                                        : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/60'
                                    }`}
                            >
                                <RadioGroupItem value="approved" id="approved" className="sr-only" />
                                <CheckCircle2 className={`h-6 w-6 mb-2 ${reviewState === 'approved' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <span className="font-bold">Approve</span>
                                <span className="text-[10px] text-muted-foreground text-center mt-1">Ready to merge</span>
                            </Label>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className={`font-bold transition-all ${reviewState === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                                reviewState === 'changes_requested' ? 'bg-destructive hover:bg-destructive/90' :
                                    'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
