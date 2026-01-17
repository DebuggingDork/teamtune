import { useState } from 'react';
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
import { useCreateBranch, useRepoBranches } from '@/hooks/useGithub';
import { toast } from '@/hooks/use-toast';
import { Loader2, GitBranch } from 'lucide-react';

const formSchema = z.object({
    branch_name: z.string().min(1, 'Branch name is required').regex(/^[a-zA-Z0-9._/-]+$/, 'Only letters, numbers, dots, dashes, underscores, and slashes allowed'),
    from_branch: z.string().min(1, 'Source branch is required'),
});

interface CreateBranchModalProps {
    repositoryId: number;
    repositoryName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CreateBranchModal({ repositoryId, repositoryName, isOpen, onClose }: CreateBranchModalProps) {
    const repoId = String(repositoryId);
    const { data: branches, isLoading: isLoadingBranches } = useRepoBranches(repoId);
    const createBranchMutation = useCreateBranch();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            branch_name: '',
            from_branch: 'main',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createBranchMutation.mutateAsync({
                repoId,
                data: values,
            });
            toast({
                title: 'Success',
                description: `Branch "${values.branch_name}" created successfully!`,
            });
            onClose();
            form.reset();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to create branch.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <GitBranch className="h-6 w-6 text-primary" />
                        Create New Branch
                    </DialogTitle>
                    <DialogDescription>
                        Create a new branch in <span className="font-semibold text-foreground">{repositoryName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="from_branch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source Branch</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoadingBranches}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select a source branch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {branches?.map(branch => (
                                                <SelectItem key={branch.name} value={branch.name}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The branch you want to base your new branch on.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branch_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Branch Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="feature/new-integration" {...field} className="pl-9 bg-background/50" />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Use a descriptive name like <code className="text-xs">fix/bug-id</code> or <code className="text-xs">feature/name</code>.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-2">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={createBranchMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createBranchMutation.isPending} className="bg-primary hover:bg-primary/90">
                                {createBranchMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Branch'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
