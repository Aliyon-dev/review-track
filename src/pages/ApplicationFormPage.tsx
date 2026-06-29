import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { canEditApplication, priorityToApi } from '@/api/mappers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input, Label, Select, Textarea } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/cn';
import { useToast } from '@/context/ToastContext';
import {
  useCreateApplication,
  useMyApplications,
  useSubmitApplication,
  useUpdateApplication,
} from '@/hooks/useApplications';
import type { ApplicationFormPayload } from '@/types/ui';

interface FormState {
  title: string;
  type: string;
  priority: string;
  amount: string;
  description: string;
  justification: string;
}

const emptyForm: FormState = {
  title: '',
  type: '',
  priority: 'Medium',
  amount: '',
  description: '',
  justification: '',
};

function buildPayload(form: FormState): ApplicationFormPayload {
  const amount = form.amount.trim();
  const payload: ApplicationFormPayload = {
    title: form.title.trim(),
    description: form.description.trim(),
  };
  if (form.type) payload.type = form.type;
  if (form.priority) payload.priority = priorityToApi(form.priority);
  if (amount && !Number.isNaN(Number(amount))) payload.amount = Number(amount);
  if (form.justification.trim()) payload.justification = form.justification.trim();
  return payload;
}

export function ApplicationFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const submitMutation = useSubmitApplication();
  const { data: myApps } = useMyApplications();

  const existing = isEdit ? myApps?.find((a) => a.id === id) : undefined;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        type: existing.type ?? '',
        priority: existing.priority ?? 'Medium',
        amount: existing.amount ?? '',
        description: existing.description,
        justification: existing.justification ?? '',
      });
    }
  }, [existing]);

  const updateField = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = (full: boolean) => {
    const e: Partial<Record<string, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (full) {
      if (!form.type) e.type = 'Select an application type.';
      if (!form.description.trim() || form.description.trim().length < 10) {
        e.description = 'Add a description (at least 10 characters).';
      }
    }
    return e;
  };

  const goBack = () => {
    if (isEdit && id) navigate(`/applications/${id}`);
    else navigate('/dashboard');
  };

  const handleSaveDraft = async () => {
    const e = validate(false);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast('error', 'Add a title before saving.');
      return;
    }
    const body = buildPayload(form);
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, body });
        showToast('success', 'Changes saved');
        navigate(`/applications/${id}`);
      } else {
        const app = await createMutation.mutateAsync(body);
        showToast('success', 'Draft created');
        navigate(`/applications/${app.id}`);
      }
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to save',
      );
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    const e = validate(true);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast('error', 'Please fix the highlighted fields');
      return;
    }
    const body = buildPayload(form);
    try {
      await updateMutation.mutateAsync({ id, body });
      await submitMutation.mutateAsync(id);
      showToast('success', 'Application submitted for review');
      navigate(`/applications/${id}`);
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to submit',
      );
    }
  };

  if (isEdit && myApps && !existing) {
    return <p className="text-sm text-brand/60">Application not found.</p>;
  }

  if (isEdit && existing && !canEditApplication(existing.status)) {
    return (
      <EmptyState
        title="This application cannot be edited"
        actionLabel="Go back"
        onAction={goBack}
      />
    );
  }

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending;

  return (
    <>
      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand/50 font-mono hover:text-brand transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <PageHeader
        title={isEdit ? 'Edit application' : 'New application'}
        description={
          isEdit
            ? 'Update the details below and save or resubmit.'
            : 'Fill in the details to create a new application.'
        }
        className="mb-6"
      />

      <Card className="max-w-2xl">
        <CardContent className="space-y-5 pt-6">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Q3 Resource Allocation"
              className={cn(errors.title && 'border-red-300 focus:border-red-400 focus:ring-red-200')}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600 font-mono">— {errors.title}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Type</Label>
              <Select
                name="type"
                value={form.type}
                onChange={updateField}
                className={cn(errors.type && 'border-red-300')}
              >
                <option value="">Select a type…</option>
                <option value="General Request">General Request</option>
                <option value="Budget Request">Budget Request</option>
                <option value="Access Request">Access Request</option>
                <option value="Procurement">Procurement</option>
                <option value="Other">Other</option>
              </Select>
              {errors.type && (
                <p className="mt-1.5 text-xs text-red-600 font-mono">— {errors.type}</p>
              )}
            </div>
            <div>
              <Label>Priority</Label>
              <Select name="priority" value={form.priority} onChange={updateField}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </div>
            <div>
              <Label>Amount (USD)</Label>
              <Input
                name="amount"
                value={form.amount}
                onChange={updateField}
                placeholder="optional"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={updateField}
              placeholder="Describe what you are requesting and why."
              className={cn(errors.description && 'border-red-300')}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600 font-mono">— {errors.description}</p>
            )}
          </div>

          <div>
            <Label>Justification</Label>
            <Textarea
              name="justification"
              rows={3}
              value={form.justification}
              onChange={updateField}
              placeholder="Optional supporting context for the reviewer."
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end max-w-2xl sticky bottom-0 bg-canvas/90 py-4 -mx-1 px-1 sm:static sm:bg-transparent sm:py-0">
        <Button variant="secondary" onClick={goBack}>Cancel</Button>
        <Button variant="secondary" onClick={handleSaveDraft} disabled={pending}>
          Save draft
        </Button>
        {isEdit ? (
          <Button onClick={handleSubmit} disabled={pending}>
            {submitMutation.isPending ? 'Submitting…' : 'Submit application'}
          </Button>
        ) : (
          <Button onClick={handleSaveDraft} disabled={pending}>
            {createMutation.isPending ? 'Creating…' : 'Create application'}
          </Button>
        )}
      </div>
    </>
  );
}
