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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTeamRepository } from '@/hooks/useGithub';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(1, 'Repository name is required').regex(/^[a-zA-Z0-9._-]+$/, 'Only letters, numbers, dots, dashes, and underscores allowed'),
    description: z.string().optional(),
    is_private: z.boolean().default(true),
    auto_init: z.boolean().default(true),
    org: z.string().optional(),
});

interface CreateRepositoryModalProps {
    teamCode: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CreateRepositoryModal({ teamCode, isOpen, onClose }: CreateRepositoryModalProps) {
    const createRepoMutation = useCreateTeamRepository();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            is_private: true,
            auto_init: true,
            org: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createRepoMutation.mutateAsync({
                teamCode,
                data: values,
            });
            toast({
                title: 'Success',
                description: 'Repository created successfully!',
            });
            onClose();
            form.reset();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to create repository.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Plus className="h-6 w-6 text-primary" />
                        Create New Repository
                    </DialogTitle>
                    <DialogDescription>
                        Create a new GitHub repository for your team.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Repository Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="my-awesome-project" {...field} className="bg-background/50" />
                                    </FormControl>
                                    <FormDescription>
                                        Great repository names are short and memorable.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="A short description of your project"
                                            {...field}
                                            className="bg-background/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-4 p-4 rounded-lg bg-accent/20 border border-border/30">
                            <FormField
                                control={form.control}
                                name="is_private"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Private Repository</FormLabel>
                                            <FormDescription>
                                                You choose who can see and commit to this repository.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="auto_init"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Initialize with README</FormLabel>
                                            <FormDescription>
                                                Immediately clone the repository to your computer.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={createRepoMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createRepoMutation.isPending} className="bg-primary hover:bg-primary/90">
                                {createRepoMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Repository'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
