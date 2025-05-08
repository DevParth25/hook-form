import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormData, Form } from '@/types';

interface UseFormSubmission {
  isSubmitting: boolean;
  apiError: string | null;
  handleSubmit: (e: FormEvent, validateForm: () => boolean) => void;
}

export function useFormSubmission(formData: FormData): UseFormSubmission {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');

  const handleSubmit = async (e: FormEvent, validateForm: () => boolean) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    const submissionData: Form = {
      id: formData.id || '',
      formName: formData.name,
      description: formData.description,
      questions: formData.questions.map((q) => ({
        id: q.id,
        title: q.title,
        questionText: q.description,
        questionType: q.type,
        scoreRanges: q.scoreRanges || [],
        options: q.checkboxOptions && q.checkboxOptions.length > 0 ? q.checkboxOptions : (formData as FormData & { newOptionInputs?: string[][] })?.newOptionInputs?.[formData.questions.indexOf(q)]?.filter((opt: string) => opt.trim()),
        required: q.isRequired,
        commentRequired: q.hasComments,
      })),
    };

    try {
      console.log('Form Structure:', submissionData);

      const method = formId ? 'PUT' : 'POST';
      const url = formId ? `/api/forms/${formId}` : '/api/forms';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      router.push('/forms');
    } catch {
      setApiError('Failed to save form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, apiError, handleSubmit };
}