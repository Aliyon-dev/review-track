import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveApplication,
  createApplication,
  getMyApplications,
  getReviewerApplication,
  getReviewerApplications,
  rejectApplication,
  returnApplication,
  startReview,
  submitApplication,
} from '@/api/client';
import { mapApplication } from '@/api/mappers';

export const applicationKeys = {
  all: ['applications'] as const,
  my: ['applications', 'my'] as const,
  reviewer: ['reviewer', 'applications'] as const,
  detail: (id: string) => ['applications', id] as const,
  reviewerDetail: (id: string) => ['reviewer', 'applications', id] as const,
};

function invalidateApplicationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: applicationKeys.reviewer });
  queryClient.invalidateQueries({ queryKey: applicationKeys.my });
  queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: applicationKeys.reviewerDetail(id) });
}

export function useMyApplications() {
  return useQuery({
    queryKey: applicationKeys.my,
    queryFn: async () => {
      const data = await getMyApplications();
      return data.map(mapApplication);
    },
  });
}

export function useReviewerApplications(enabled = true) {
  return useQuery({
    queryKey: applicationKeys.reviewer,
    queryFn: async () => {
      const data = await getReviewerApplications();
      return data.map(mapApplication);
    },
    enabled,
  });
}

export function useReviewerApplication(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.reviewerDetail(id ?? ''),
    queryFn: async () => {
      const data = await getReviewerApplication(id!);
      return mapApplication(data);
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my });
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: (_, id) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}

export function useStartReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startReview,
    onSuccess: (_, id) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveApplication,
    onSuccess: (_, id) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectApplication,
    onSuccess: (_, id) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}

export function useReturnApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnApplication,
    onSuccess: (_, id) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}
