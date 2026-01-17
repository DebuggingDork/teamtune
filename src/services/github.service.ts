import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import * as Types from '@/api/types';

// Employee Services

export const getGithubStatus = async (): Promise<Types.GitHubStatusResponse> => {
    const response = await apiClient.get<Types.GitHubStatusResponse>(ENDPOINTS.EMPLOYEE.GITHUB.STATUS);
    return response.data;
};

export const connectGitHub = async (): Promise<Types.GitHubConnectResponse> => {
    const response = await apiClient.get<Types.GitHubConnectResponse>(ENDPOINTS.EMPLOYEE.GITHUB.CONNECT);
    return response.data;
};

export const disconnectGitHub = async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(ENDPOINTS.EMPLOYEE.GITHUB.DISCONNECT);
    return response.data;
};

export const getRepositories = async (): Promise<Types.RepositoryWithAccessResponse[]> => {
    const response = await apiClient.get<Types.RepositoryWithAccessResponse[]>(ENDPOINTS.EMPLOYEE.GITHUB.REPOSITORIES);
    // Handle both direct array and wrapped response
    const data = response.data as any;
    if (Array.isArray(data)) {
        return data;
    }
    // If the response is wrapped in a 'data' property
    if (data && Array.isArray(data.data)) {
        return data.data;
    }
    // Fallback to empty array if structure is unexpected
    console.warn('Unexpected repositories response structure:', data);
    return [];
};

export const getRepoBranches = async (repoId: string): Promise<Types.BranchResponse[]> => {
    const response = await apiClient.get<Types.BranchResponse[]>(ENDPOINTS.EMPLOYEE.GITHUB.REPO_BRANCHES(repoId));
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected repo branches response structure:', data);
    return [];
};

export const getMyBranches = async (): Promise<Types.UserBranchResponse[]> => {
    const response = await apiClient.get<Types.UserBranchResponse[]>(ENDPOINTS.EMPLOYEE.GITHUB.MY_BRANCHES);
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected my branches response structure:', data);
    return [];
};

export const createBranch = async (repoId: string, data: Types.CreateBranchRequest): Promise<Types.BranchResponse> => {
    const response = await apiClient.post<Types.BranchResponse>(ENDPOINTS.EMPLOYEE.GITHUB.REPO_BRANCHES(repoId), data);
    return response.data;
};

export const getPullRequests = async (state?: Types.PRState): Promise<Types.PullRequestResponse[]> => {
    const params = state ? { state } : {};
    const response = await apiClient.get<Types.PullRequestResponse[]>(ENDPOINTS.EMPLOYEE.GITHUB.PULL_REQUESTS, { params });
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected pull requests response structure:', data);
    return [];
};

export const getRepoPullRequests = async (repoId: string, state?: Types.PRState): Promise<Types.PullRequestResponse[]> => {
    const params = state ? { state } : {};
    const response = await apiClient.get<Types.PullRequestResponse[]>(ENDPOINTS.EMPLOYEE.GITHUB.REPO_PULL_REQUESTS(repoId), { params });
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected repo pull requests response structure:', data);
    return [];
};

export const createPullRequest = async (repoId: string, data: Types.CreatePRRequest): Promise<Types.PullRequestResponse> => {
    const response = await apiClient.post<Types.PullRequestResponse>(ENDPOINTS.EMPLOYEE.GITHUB.REPO_PULL_REQUESTS(repoId), data);
    return response.data;
};

export const getPullRequestDetails = async (prId: string): Promise<Types.PullRequestWithReviewsResponse> => {
    const response = await apiClient.get<Types.PullRequestWithReviewsResponse>(
        ENDPOINTS.EMPLOYEE.GITHUB.PULL_REQUEST_DETAILS(prId)
    );
    return response.data;
};

export const requestReview = async (prId: string, data: Types.RequestReviewRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
        ENDPOINTS.EMPLOYEE.GITHUB.REQUEST_REVIEW(prId),
        data
    );
    return response.data;
};


// Team Lead Services

export const getTeamLeadGithubStatus = async (): Promise<Types.GitHubStatusResponse> => {
    const response = await apiClient.get<Types.GitHubStatusResponse>(ENDPOINTS.TEAM_LEAD.GITHUB.STATUS);
    return response.data;
};

export const disconnectTeamLeadGitHub = async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(ENDPOINTS.TEAM_LEAD.GITHUB.DISCONNECT);
    return response.data;
};

export const createRepository = async (teamCode: string, data: Types.CreateRepositoryRequest): Promise<Types.RepositoryResponse> => {
    const response = await apiClient.post<Types.RepositoryResponse>(ENDPOINTS.TEAM_LEAD.GITHUB.REPOSITORY(teamCode), data);
    return response.data;
};

export const getTeamRepository = async (teamCode: string): Promise<Types.RepositoryResponse> => {
    const response = await apiClient.get<Types.RepositoryResponse>(ENDPOINTS.TEAM_LEAD.GITHUB.REPOSITORY(teamCode));
    return response.data;
};

export const addCollaborators = async (teamCode: string, data: Types.AddCollaboratorsRequest): Promise<{ results: any[] }> => {
    // The response wrapper has a results array, checking types... 
    // Docs say: { results: [ { user_code, success, collaborator?, error? } ] }
    // I'll return the whole data object
    const response = await apiClient.post<{ results: any[] }>(ENDPOINTS.TEAM_LEAD.GITHUB.COLLABORATORS(teamCode), data);
    return response.data;
};

export const getCollaborators = async (teamCode: string): Promise<Types.CollaboratorResponse[]> => {
    const response = await apiClient.get<Types.CollaboratorResponse[]>(ENDPOINTS.TEAM_LEAD.GITHUB.COLLABORATORS(teamCode));
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected collaborators response structure:', data);
    return [];
};

export const removeCollaborator = async (teamCode: string, userCode: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.TEAM_LEAD.GITHUB.REMOVE_COLLABORATOR(teamCode, userCode)
    );
    return response.data;
};

export const getTeamPullRequests = async (teamCode: string, state?: Types.PRState): Promise<Types.PullRequestResponse[]> => {
    const params = state ? { state } : {};
    const response = await apiClient.get<Types.PullRequestResponse[]>(
        ENDPOINTS.TEAM_LEAD.GITHUB.PULL_REQUESTS(teamCode),
        { params }
    );
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    console.warn('Unexpected team pull requests response structure:', data);
    return [];
};

export const getTeamPullRequestDetails = async (teamCode: string, prNumber: number): Promise<Types.PullRequestWithReviewsResponse> => {
    const response = await apiClient.get<Types.PullRequestWithReviewsResponse>(
        ENDPOINTS.TEAM_LEAD.GITHUB.PULL_REQUEST_DETAILS(teamCode, prNumber)
    );
    return response.data;
};

export const submitReview = async (teamCode: string, prNumber: number, data: Types.SubmitReviewRequest): Promise<{ message: string, data: Types.ReviewResponse }> => {
    const response = await apiClient.post<{ message: string, data: Types.ReviewResponse }>(
        ENDPOINTS.TEAM_LEAD.GITHUB.SUBMIT_REVIEW(teamCode, prNumber),
        data
    );
    return response.data;
};

export const mergePullRequest = async (teamCode: string, prNumber: number, data: Types.MergePRRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
        ENDPOINTS.TEAM_LEAD.GITHUB.MERGE_PR(teamCode, prNumber),
        data
    );
    return response.data;
};
