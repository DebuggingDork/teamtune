import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as githubService from '@/services/github.service';
import type {
    CreateBranchRequest,
    CreatePRRequest,
    RequestReviewRequest,
    CreateRepositoryRequest,
    AddCollaboratorsRequest,
    SubmitReviewRequest,
    MergePRRequest,
    PRState,
    UserRole,
} from '@/api/types/index';
import { handleError } from '@/utils/errorHandler';
import { useAuth } from '@/hooks/useAuth';

// Query Keys
export const githubKeys = {
    employee: {
        status: ['github', 'employee', 'status'] as const,
        repositories: ['github', 'employee', 'repositories'] as const,
        repoBranches: (repoId: string) => ['github', 'employee', 'repositories', repoId, 'branches'] as const,
        myBranches: ['github', 'employee', 'my-branches'] as const,
        pullRequests: (state?: string) => ['github', 'employee', 'pull-requests', state] as const,
        repoPullRequests: (repoId: string, state?: string) => ['github', 'employee', 'repositories', repoId, 'pull-requests', state] as const,
        pullRequestDetails: (prId: string) => ['github', 'employee', 'pull-requests', prId] as const,
    },
    teamLead: {
        status: ['github', 'team-lead', 'status'] as const,
        repository: (teamCode: string) => ['github', 'team-lead', teamCode, 'repository'] as const,
        collaborators: (teamCode: string) => ['github', 'team-lead', teamCode, 'collaborators'] as const,
        pullRequests: (teamCode: string, state?: string) => ['github', 'team-lead', teamCode, 'pull-requests', state] as const,
        pullRequestDetails: (teamCode: string, prNumber: number) => ['github', 'team-lead', teamCode, 'pull-requests', prNumber] as const,
    },
};

// Employee Hooks

export const useConnectGitHub = () => {
    return useMutation({
        mutationFn: githubService.connectGitHub,
        onError: handleError,
    });
};

export const useDisconnectGitHub = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isTeamLead = user?.role === 'team_lead';

    return useMutation({
        mutationFn: isTeamLead ? githubService.disconnectTeamLeadGitHub : githubService.disconnectGitHub,
        onSuccess: () => {
            if (isTeamLead) {
                queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.status });
            } else {
                queryClient.invalidateQueries({ queryKey: githubKeys.employee.status });
                queryClient.invalidateQueries({ queryKey: githubKeys.employee.repositories });
            }
        },
        onError: handleError,
    });
};

export const useGithubStatus = () => {
    const { user } = useAuth();
    const isTeamLead = user?.role === 'team_lead';

    return useQuery({
        queryKey: isTeamLead ? githubKeys.teamLead.status : githubKeys.employee.status,
        queryFn: isTeamLead ? githubService.getTeamLeadGithubStatus : githubService.getGithubStatus,
        staleTime: 300000,
        refetchOnWindowFocus: true,
        retry: false,
    });
};

export const useAccessibleRepositories = () => {
    return useQuery({
        queryKey: githubKeys.employee.repositories,
        queryFn: githubService.getRepositories,
        staleTime: 60000,
    });
};

export const useRepoBranches = (repoId: string) => {
    return useQuery({
        queryKey: githubKeys.employee.repoBranches(repoId),
        queryFn: () => githubService.getRepoBranches(repoId),
        enabled: !!repoId,
        staleTime: 60000,
    });
};

export const useMyBranches = () => {
    return useQuery({
        queryKey: githubKeys.employee.myBranches,
        queryFn: githubService.getMyBranches,
        staleTime: 60000,
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ repoId, data }: { repoId: string; data: CreateBranchRequest }) =>
            githubService.createBranch(repoId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.repoBranches(variables.repoId) });
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.myBranches });
        },
        onError: handleError,
    });
};

export const useMyPullRequests = (state?: PRState) => {
    return useQuery({
        queryKey: githubKeys.employee.pullRequests(state),
        queryFn: () => githubService.getPullRequests(state),
        staleTime: 60000,
    });
};

export const useRepoPullRequests = (repoId: string, state?: PRState) => {
    return useQuery({
        queryKey: githubKeys.employee.repoPullRequests(repoId, state),
        queryFn: () => githubService.getRepoPullRequests(repoId, state),
        enabled: !!repoId,
        staleTime: 60000,
    });
};

export const useCreatePullRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ repoId, data }: { repoId: string; data: CreatePRRequest }) =>
            githubService.createPullRequest(repoId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.pullRequests() });
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.repoPullRequests(variables.repoId) });
        },
        onError: handleError,
    });
};

export const usePullRequestDetails = (prId: string) => {
    return useQuery({
        queryKey: githubKeys.employee.pullRequestDetails(prId),
        queryFn: () => githubService.getPullRequestDetails(prId),
        enabled: !!prId,
        staleTime: 60000,
    });
};

export const useRequestReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ prId, data }: { prId: string; data: RequestReviewRequest }) =>
            githubService.requestReview(prId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.employee.pullRequestDetails(variables.prId) });
        },
        onError: handleError,
    });
};

// Team Lead Hooks

export const useCreateTeamRepository = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamCode, data }: { teamCode: string; data: CreateRepositoryRequest }) =>
            githubService.createRepository(teamCode, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.repository(variables.teamCode) });
        },
        onError: handleError,
    });
};

export const useTeamRepository = (teamCode: string) => {
    return useQuery({
        queryKey: githubKeys.teamLead.repository(teamCode),
        queryFn: () => githubService.getTeamRepository(teamCode),
        enabled: !!teamCode,
        staleTime: 300000,
        retry: false,
    });
};

export const useAddCollaborators = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamCode, data }: { teamCode: string; data: AddCollaboratorsRequest }) =>
            githubService.addCollaborators(teamCode, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.collaborators(variables.teamCode) });
        },
        onError: handleError,
    });
};

export const useTeamCollaborators = (teamCode: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: githubKeys.teamLead.collaborators(teamCode),
        queryFn: () => githubService.getCollaborators(teamCode),
        enabled: !!teamCode && enabled,
        staleTime: 60000,
        retry: false,
    });
};

export const useRemoveCollaborator = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamCode, userCode }: { teamCode: string; userCode: string }) =>
            githubService.removeCollaborator(teamCode, userCode),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.collaborators(variables.teamCode) });
        },
        onError: handleError,
    });
};

export const useTeamPullRequests = (teamCode: string, state?: PRState, enabled: boolean = true) => {
    return useQuery({
        queryKey: githubKeys.teamLead.pullRequests(teamCode, state),
        queryFn: () => githubService.getTeamPullRequests(teamCode, state),
        enabled: !!teamCode && enabled,
        staleTime: 60000,
        retry: false,
    });
};

export const useTeamPullRequestDetails = (teamCode: string, prNumber: number) => {
    return useQuery({
        queryKey: githubKeys.teamLead.pullRequestDetails(teamCode, prNumber),
        queryFn: () => githubService.getTeamPullRequestDetails(teamCode, prNumber),
        enabled: !!teamCode && !!prNumber,
        staleTime: 60000,
    });
};

export const useSubmitReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamCode, prNumber, data }: { teamCode: string; prNumber: number; data: SubmitReviewRequest }) =>
            githubService.submitReview(teamCode, prNumber, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.pullRequestDetails(variables.teamCode, variables.prNumber) });
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.pullRequests(variables.teamCode) });
        },
        onError: handleError,
    });
};

export const useMergePullRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamCode, prNumber, data }: { teamCode: string; prNumber: number; data: MergePRRequest }) =>
            githubService.mergePullRequest(teamCode, prNumber, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.pullRequestDetails(variables.teamCode, variables.prNumber) });
            queryClient.invalidateQueries({ queryKey: githubKeys.teamLead.pullRequests(variables.teamCode) });
        },
        onError: handleError,
    });
};
