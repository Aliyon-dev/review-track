import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { canEditApplication, priorityToApi } from '@/api/mappers';
import { useToast } from '@/context/ToastContext';
import {
  useCreateApplication,
  useMyApplications,
  useSubmitApplication,
  useUpdateApplication,
} from '@/hooks/useApplications';
import type { ApplicationFormPayload } from '@/types/ui';
import styles from './ApplicationFormPage.module.css';

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
    return <p className={styles.loading}>Application not found.</p>;
  }

  if (isEdit && existing && !canEditApplication(existing.status)) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">This application cannot be edited</div>
        <button type="button" className="btn-secondary" onClick={goBack}>
          Go back
        </button>
      </div>
    );
  }

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending;

  return (
    <>
      <button type="button" className="btn-ghost" onClick={goBack}>
        <span className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </span>
      </button>

      <div className="page-header" style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24 }}>
          {isEdit ? 'Edit application' : 'New application'}
        </h1>
        <p>
          {isEdit
            ? 'Update the details below and save or resubmit.'
            : 'Fill in the details to create a new application.'}
        </p>
      </div>

      <div className={styles.formWrap}>
        <div className={styles.field}>
          <label className="mono-label">Title</label>
          <input
            name="title"
            className={`field-input ${errors.title ? 'error' : ''}`}
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Q3 Resource Allocation"
          />
          {errors.title && (
            <div className="field-error">— {errors.title}</div>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className="mono-label">Type</label>
            <select
              name="type"
              className={`field-input ${errors.type ? 'error' : ''}`}
              value={form.type}
              onChange={updateField}
            >
              <option value="">Select a type…</option>
              <option value="General Request">General Request</option>
              <option value="Budget Request">Budget Request</option>
              <option value="Access Request">Access Request</option>
              <option value="Procurement">Procurement</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && (
              <div className="field-error">— {errors.type}</div>
            )}
          </div>
          <div className={styles.field}>
            <label className="mono-label">Priority</label>
            <select
              name="priority"
              className="field-input"
              value={form.priority}
              onChange={updateField}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className="mono-label">Amount (USD)</label>
            <input
              name="amount"
              className="field-input"
              value={form.amount}
              onChange={updateField}
              placeholder="optional"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className="mono-label">Description</label>
          <textarea
            name="description"
            className={`field-input ${errors.description ? 'error' : ''}`}
            rows={4}
            value={form.description}
            onChange={updateField}
            placeholder="Describe what you are requesting and why."
          />
          {errors.description && (
            <div className="field-error">— {errors.description}</div>
          )}
        </div>

        <div className={styles.field}>
          <label className="mono-label">Justification</label>
          <textarea
            name="justification"
            className="field-input"
            rows={3}
            value={form.justification}
            onChange={updateField}
            placeholder="Optional supporting context for the reviewer."
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn-secondary" onClick={goBack}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSaveDraft}
            disabled={pending}
          >
            {isEdit ? 'Save draft' : 'Save draft'}
          </button>
          {isEdit ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={pending}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit application'}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveDraft}
              disabled={pending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create application'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
