import { getToken } from '@/api/token';
import type {
  ApiActivityEvent,
  ApiApplication,
  ApiStatus,
  ApiUser,
  ApplicationFormPayload,
} from '@/types/ui';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

interface SuccessEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const body = (await res.json()) as SuccessEnvelope<T>;
  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? 'Request failed', res.status);
  }
  return body.data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  return parseJsonResponse<T>(res);
}

export async function healthCheck(): Promise<void> {
  await apiFetch<{ success?: boolean }>('/api/health', {}, false);
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: ApiUser }> {
  return apiFetch<{ token: string; user: ApiUser }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );
}

export async function getMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/api/auth/me');
}

export async function logout(): Promise<void> {
  await apiFetch<{ message?: string }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getMyApplications(): Promise<ApiApplication[]> {
  return apiFetch<ApiApplication[]>('/api/applications/my');
}

export async function getApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(`/api/applications/${id}`);
}

export async function createApplication(
  body: ApplicationFormPayload,
): Promise<ApiApplication> {
  return apiFetch<ApiApplication>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateApplication(
  id: string,
  body: Partial<ApplicationFormPayload>,
): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(`/api/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api/applications/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 204) return;

  await parseJsonResponse<unknown>(res);
}

export async function submitApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(`/api/applications/${id}/submit`, {
    method: 'PATCH',
  });
}

export async function getApplicationEvents(
  id: string,
): Promise<ApiActivityEvent[]> {
  return apiFetch<ApiActivityEvent[]>(`/api/applications/${id}/events`);
}

export async function addApplicationComment(
  id: string,
  comment: string,
): Promise<void> {
  await apiFetch(`/api/applications/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

// Reviewer endpoints
export async function getReviewerApplications(): Promise<ApiApplication[]> {
  return apiFetch<ApiApplication[]>('/api/reviewer/applications');
}

export async function getReviewerApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(`/api/reviewer/applications/${id}`);
}

export async function startReview(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(
    `/api/reviewer/applications/${id}/start-review`,
    { method: 'POST' },
  );
}

export async function approveApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(
    `/api/reviewer/applications/${id}/approve`,
    { method: 'POST' },
  );
}

export async function rejectApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(
    `/api/reviewer/applications/${id}/reject`,
    { method: 'POST' },
  );
}

export async function returnApplication(id: string): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(
    `/api/reviewer/applications/${id}/return`,
    { method: 'POST' },
  );
}

// Legacy generic status update (admin / fallback)
export async function updateApplicationStatus(
  id: string,
  status: ApiStatus,
): Promise<ApiApplication> {
  return apiFetch<ApiApplication>(`/api/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
