import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitReview } from '@/hooks/useGithub';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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

    const handleSubmit = () => {
        mutation.mutate({
            teamCode,
            prNumber,
            data: {
                state: reviewState,
                body: comment
            }
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setComment('');
                setReviewState('commented');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Review Pull Request #{prNumber}</DialogTitle>
                    <DialogDescription>
                        {prTitle}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <Label>Review Comment</Label>
                        <Textarea
                            placeholder="Add your review comments here (Markdown supported)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Review Decision</Label>
                        <RadioGroup value={reviewState} onValueChange={(v: any) => setReviewState(v)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="commented" id="commented" />
                                <Label htmlFor="commented">Comment</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="changes_requested" id="changes_requested" />
                                <Label htmlFor="changes_requested">Request Changes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="approved" id="approved" />
                                <Label htmlFor="approved">Approve</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
