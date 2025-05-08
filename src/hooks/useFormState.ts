import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { FormData, Form, FormErrors } from '@/types';

interface UseFormState {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleBasicInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleQuestionChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  addQuestion: () => void;
  removeQuestion: (index: number, setErrors: (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void) => void;
}

export function useFormState(): UseFormState {
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    questions: [
      {
        id: uuidv4(),
        title: 'Housing',
        description: 'Select a number from the range that most closely relates to your situation',
        type: 'score',
        scoreRanges: [{ title: 'Range 1', min: 0, max: 0 }],
        isRequired: false,
        hasComments: false,
      },
      {
        id: uuidv4(),
        title: 'Dosing Consistency',
        description: 'Select a number from the range that most closely relates to your situation',
        type: 'score',
        scoreRanges: [{ title: 'Range 1', min: 0, max: 0 }],
        isRequired: false,
        hasComments: false,
      },
    ],
  });

  // Fetch form data if editing
  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        try {
          const response = await fetch('/api/forms');
          if (!response.ok) throw new Error('Failed to fetch forms');
          const forms: Form[] = await response.json();
          const form = forms.find((f) => f.id === formId);
          if (form) {
            setFormData({
              id: form.id,
              name: form.formName,
              description: form.description,
              questions: form.questions.map((q) => ({
                id: q.id,
                title: q.title,
                description: q.questionText,
                type: q.questionType,
                scoreRanges: q.scoreRanges,
                checkboxOptions: q.options,
                isRequired: q.required,
                hasComments: q.commentRequired,
              })),
            });
          }
        } catch (error) {
          console.error('Error fetching form:', error);
        }
      };
      fetchForm();
    }
  }, [formId]);

  const handleBasicInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const updatedQuestions = [...formData.questions];
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

    if (name === 'isRequired' || name === 'hasComments') {
      updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
    } else if (name === 'type') {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        type: value as 'score' | 'checkbox',
        scoreRanges: value === 'score' ? [{ title: 'Range 1', min: 0, max: 0 }] : undefined,
        checkboxOptions: value === 'checkbox' ? [] : undefined,
        isRequired: false,
        hasComments: false,
      };
    } else {
      updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
    }

    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: uuidv4(),
          title: '',
          description: '',
          type: 'score',
          scoreRanges: [{ title: 'Range 1', min: 0, max: 0 }],
          isRequired: false,
          hasComments: false,
        },
      ],
    });
  };

  const removeQuestion = (index: number, setErrors: (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void) => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter((_, i) => i !== index),
      });
      setErrors((prev: FormErrors) => {
        const newErrors: FormErrors = { ...prev };
        newErrors.questions = (prev.questions || []).filter(
          (_: { title?: string; description?: string; scoreRanges?: string; options?: string }, i: number) => i !== index
        );
        return newErrors;
      });
    }
  };

  return {
    formData,
    setFormData,
    handleBasicInfoChange,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
  };
}