import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePullRequest, useRepoBranches } from '@/hooks/useGithub';
import { toast } from '@/hooks/use-toast';
import { Loader2, GitPullRequest, GitMerge } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().optional(),
    head: z.string().min(1, 'Head branch is required'),
    base: z.string().min(1, 'Base branch is required'),
});

interface CreatePRModalProps {
    repositoryId: number;
    repositoryName: string;
    isOpen: boolean;
    onClose: () => void;
    defaultHead?: string;
}

export function CreatePRModal({ repositoryId, repositoryName, isOpen, onClose, defaultHead }: CreatePRModalProps) {
    const repoId = String(repositoryId);
    const { data: branches, isLoading: isLoadingBranches } = useRepoBranches(repoId);
    const createPRMutation = useCreatePullRequest();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            body: '',
            head: defaultHead || '',
            base: 'main',
        },
    });

    // Update form when defaultHead changes
    useMemo(() => {
        if (defaultHead) form.setValue('head', defaultHead);
    }, [defaultHead, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createPRMutation.mutateAsync({
                repoId,
                data: values,
            });
            toast({
                title: 'Success',
                description: 'Pull Request created successfully!',
            });
            onClose();
            form.reset();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to create pull request.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <GitPullRequest className="h-6 w-6 text-primary" />
                        Create Pull Request
                    </DialogTitle>
                    <DialogDescription>
                        Propose changes from <span className="font-semibold text-foreground">{repositoryName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="flex items-center gap-3 p-3 bg-accent/20 border border-border/30 rounded-xl mb-4">
                            <div className="flex-1">
                                <FormField
                                    control={form.control}
                                    name="base"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs uppercase text-muted-foreground font-bold">Base</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background/50 h-9">
                                                        <SelectValue placeholder="base" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {branches?.map(b => (
                                                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <GitMerge className="h-4 w-4 text-muted-foreground mt-6" />
                            <div className="flex-1">
                                <FormField
                                    control={form.control}
                                    name="head"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs uppercase text-muted-foreground font-bold">Compare</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background/50 h-9">
                                                        <SelectValue placeholder="compare" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {branches?.map(b => (
                                                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Fix: authentication bug in login flow" {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What does this change do?"
                                            {...field}
                                            className="bg-background/50 min-h-[120px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe the changes and link to relevant tasks.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-2">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={createPRMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createPRMutation.isPending} className="bg-primary hover:bg-primary/90">
                                {createPRMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating PR...
                                    </>
                                ) : (
                                    'Create Pull Request'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
