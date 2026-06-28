import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { DisabledWithTooltip } from '@/components/DisabledWithTooltip';
import { useToast } from '@/context/ToastContext';
import {
  useCreateApplication,
  useMyApplications,
  useSubmitApplication,
} from '@/hooks/useApplications';
import { API_GAP_TOOLTIP } from '@/types/ui';
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

export function ApplicationFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createMutation = useCreateApplication();
  const submitMutation = useSubmitApplication();
  const { data: myApps } = useMyApplications();

  const existing = isEdit ? myApps?.find((a) => a.id === id) : undefined;

  const [form, setForm] = useState<FormState>(() =>
    existing
      ? {
          title: existing.title,
          type: '',
          priority: 'Medium',
          amount: '',
          description: existing.description,
          justification: '',
        }
      : emptyForm,
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        type: '',
        priority: 'Medium',
        amount: '',
        description: existing.description,
        justification: '',
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
    if (full || !isEdit) {
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

  const handleCreate = async () => {
    const e = validate(true);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast('error', 'Please fix the highlighted fields');
      return;
    }
    try {
      const app = await createMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
      });
      showToast('success', 'Application created');
      navigate(`/applications/${app.id}`);
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError ? err.message : 'Failed to create',
      );
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
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

  return (
    <>
      <button type="button" className="btn-ghost" onClick={goBack}>
        <span className={styles.backBtn}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            disabled={isEdit}
          />
          {errors.title && (
            <div className="field-error">— {errors.title}</div>
          )}
        </div>

        <div className={styles.row}>
          <DisabledWithTooltip block className={styles.field}>
            <label className="mono-label">Type</label>
            <select
              name="type"
              className="field-input"
              value={form.type}
              onChange={updateField}
              disabled
            >
              <option value="">Select a type…</option>
              <option value="General Request">General Request</option>
              <option value="Budget Request">Budget Request</option>
              <option value="Access Request">Access Request</option>
              <option value="Procurement">Procurement</option>
              <option value="Other">Other</option>
            </select>
          </DisabledWithTooltip>
          <DisabledWithTooltip block className={styles.field}>
            <label className="mono-label">Priority</label>
            <select
              name="priority"
              className="field-input"
              value={form.priority}
              onChange={updateField}
              disabled
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </DisabledWithTooltip>
          <DisabledWithTooltip block className={styles.field}>
            <label className="mono-label">Amount (USD)</label>
            <input
              name="amount"
              className="field-input"
              value={form.amount}
              onChange={updateField}
              placeholder="optional"
              disabled
            />
          </DisabledWithTooltip>
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
            disabled={isEdit}
          />
          {errors.description && (
            <div className="field-error">— {errors.description}</div>
          )}
        </div>

        <DisabledWithTooltip block className={styles.field}>
          <label className="mono-label">Justification</label>
          <textarea
            name="justification"
            className="field-input"
            rows={3}
            value={form.justification}
            onChange={updateField}
            placeholder="Optional supporting context for the reviewer."
            disabled
          />
        </DisabledWithTooltip>

        <div className={styles.actions}>
          <button type="button" className="btn-secondary" onClick={goBack}>
            Cancel
          </button>
          {isEdit ? (
            <>
              <DisabledWithTooltip>
                <button type="button" className="btn-secondary" disabled>
                  Save draft
                </button>
              </DisabledWithTooltip>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={
                  submitMutation.isPending ||
                  existing?.status !== 'draft' &&
                    existing?.status !== 'changes_requested'
                }
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit application'}
              </button>
            </>
          ) : (
            <>
              <DisabledWithTooltip tooltip={API_GAP_TOOLTIP}>
                <button type="button" className="btn-secondary" disabled>
                  Save draft
                </button>
              </DisabledWithTooltip>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating…' : 'Create application'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
