import { useState } from 'react';
import { FormData, FormErrors } from '@/types';

interface UseFormValidation {
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  validateForm: () => boolean;
}

export function useFormValidation(
  formData: FormData,
  scoreRangeInputs: Array<Array<{ title: string; min: number | ''; max: number | '' }>>,
  newOptionInputs: Array<string[]>
): UseFormValidation {
  const [errors, setErrors] = useState<FormErrors>({ questions: [] });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      questions: [],
    };

    // Validate form name
    if (!formData.name.trim()) {
      newErrors.name = 'Form Name is required';
    }

    // Validate form description
    if (!formData.description.trim()) {
      newErrors.description = 'Form Description is required';
    }

    // Validate questions
    formData.questions.forEach((question, index) => {
      const questionErrors: FormErrors['questions'][number] = {};

      if (!question.title.trim()) {
        questionErrors.title = 'Question Title is required';
      }

      if (!question.description.trim()) {
        questionErrors.description = 'Question Description is required';
      }

      if (question.type === 'score' && scoreRangeInputs[index]) {
        const ranges = scoreRangeInputs[index];
        const hasInvalidRange = ranges.some((range, i) => {
          const min = range.min === '' ? 0 : Number(range.min);
          const max = range.max === '' ? 0 : Number(range.max);
          return max <= min || (i > 0 && min <= Number(ranges[i - 1].max));
        });
        if (hasInvalidRange) {
          questionErrors.scoreRanges = 'Score ranges must have valid start/end values (end > start, non-overlapping)';
        }
      }

      if (question.type === 'checkbox' && (!question.checkboxOptions || question.checkboxOptions.length === 0)) {
        if (!newOptionInputs[index] || newOptionInputs[index].every((opt) => !opt.trim())) {
          questionErrors.options = 'At least one checkbox option is required';
        }
      }

      newErrors.questions.push(questionErrors);
    });

    setErrors(newErrors);

    return (
      !newErrors.name &&
      !newErrors.description &&
      newErrors.questions.every((q) => !q.title && !q.description && !q.scoreRanges && !q.options)
    );
  };

  return { errors, setErrors, validateForm };
}