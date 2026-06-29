import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addApplicationComment,
  approveApplication,
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationEvents,
  getMyApplications,
  getReviewerApplication,
  getReviewerApplications,
  rejectApplication,
  returnApplication,
  startReview,
  submitApplication,
  updateApplication,
} from '@/api/client';
import { mapActivityEvent, mapApplication } from '@/api/mappers';
import type { ApplicationFormPayload } from '@/types/ui';

export const applicationKeys = {
  all: ['applications'] as const,
  my: ['applications', 'my'] as const,
  reviewer: ['reviewer', 'applications'] as const,
  detail: (id: string) => ['applications', id] as const,
  reviewerDetail: (id: string) => ['reviewer', 'applications', id] as const,
  events: (id: string) => ['applications', id, 'events'] as const,
};

function invalidateApplicationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: applicationKeys.reviewer });
  queryClient.invalidateQueries({ queryKey: applicationKeys.my });
  queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: applicationKeys.reviewerDetail(id) });
  queryClient.invalidateQueries({ queryKey: applicationKeys.events(id) });
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

export function useApplication(
  id: string | undefined,
  enabled = true,
  asReviewer = false,
) {
  return useQuery({
    queryKey: asReviewer
      ? applicationKeys.reviewerDetail(id ?? '')
      : applicationKeys.detail(id ?? ''),
    queryFn: async () => {
      const data = asReviewer
        ? await getReviewerApplication(id!)
        : await getApplication(id!);
      return mapApplication(data);
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useApplicationEvents(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.events(id ?? ''),
    queryFn: async () => {
      const data = await getApplicationEvents(id!);
      return data.map(mapActivityEvent);
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

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<ApplicationFormPayload>;
    }) => updateApplication(id, body),
    onSuccess: (_, { id }) => {
      invalidateApplicationQueries(queryClient, id);
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my });
      queryClient.invalidateQueries({ queryKey: applicationKeys.reviewer });
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

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      addApplicationComment(id, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.events(id) });
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
