import { useState } from 'react';
import { FormData } from '@/types';

interface UseScoreRanges {
  scoreRangeInputs: { title: string; min: number | ''; max: number | '' }[][];
  setScoreRangeInputs: (inputs: { title: string; min: number | ''; max: number | '' }[][]) => void;
  handleScoreRangeInput: (
    questionIndex: number,
    rangeIndex: number,
    field: 'title' | 'min' | 'max',
    value: string
  ) => void;
  handleScoreRangeBlur: (questionIndex: number, rangeIndex: number, field: 'min' | 'max') => void;
  addScoreRange: (questionIndex: number) => void;
  removeScoreRangeInput: (questionIndex: number, rangeIndex: number) => void;
}

export function useScoreRanges(formData: FormData, setFormData: (data: FormData) => void): UseScoreRanges {
  const [scoreRangeInputs, setScoreRangeInputs] = useState<
    { title: string; min: number | ''; max: number | '' }[][]
  >(formData.questions.map(() => [{ title: 'Range 1', min: 0, max: 0 }]));

  const handleScoreRangeInput = (
    questionIndex: number,
    rangeIndex: number,
    field: 'title' | 'min' | 'max',
    value: string
  ) => {
    const updatedScoreRangeInputs = [...scoreRangeInputs];
    if (field === 'title') {
      updatedScoreRangeInputs[questionIndex][rangeIndex] = {
        ...updatedScoreRangeInputs[questionIndex][rangeIndex],
        [field]: value,
      };
    } else {
      const parsedValue = value === '' ? '' : parseInt(value.replace(/^0+/, '') || '0', 10);
      updatedScoreRangeInputs[questionIndex][rangeIndex] = {
        ...updatedScoreRangeInputs[questionIndex][rangeIndex],
        [field]: parsedValue,
      };
    }
    setScoreRangeInputs(updatedScoreRangeInputs);

    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].scoreRanges = updatedScoreRangeInputs[questionIndex].map((range) => ({
      title: range.title,
      min: typeof range.min === 'number' ? range.min : 0,
      max: typeof range.max === 'number' ? range.max : 0,
    }));
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleScoreRangeBlur = (
    questionIndex: number,
    rangeIndex: number,
    field: 'min' | 'max'
  ) => {
    const updatedScoreRangeInputs = [...scoreRangeInputs];
    const currentValue = updatedScoreRangeInputs[questionIndex][rangeIndex][field];
    if (currentValue === '') {
      updatedScoreRangeInputs[questionIndex][rangeIndex][field] = 0;
      setScoreRangeInputs(updatedScoreRangeInputs);

      const updatedQuestions = [...formData.questions];
      updatedQuestions[questionIndex].scoreRanges = updatedScoreRangeInputs[questionIndex].map((range) => ({
        title: range.title,
        min: typeof range.min === 'number' ? range.min : 0,
        max: typeof range.max === 'number' ? range.max : 0,
      }));
      setFormData({ ...formData, questions: updatedQuestions });
    }
  };

  const addScoreRange = (questionIndex: number) => {
    const updatedScoreRangeInputs = [...scoreRangeInputs];
    updatedScoreRangeInputs[questionIndex] = [
      ...updatedScoreRangeInputs[questionIndex],
      { title: `Range ${updatedScoreRangeInputs[questionIndex].length + 1}`, min: 0, max: 0 },
    ];
    setScoreRangeInputs(updatedScoreRangeInputs);

    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].scoreRanges = updatedScoreRangeInputs[questionIndex].map((range) => ({
      title: range.title,
      min: typeof range.min === 'number' ? range.min : 0,
      max: typeof range.max === 'number' ? range.max : 0,
    }));
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeScoreRangeInput = (questionIndex: number, rangeIndex: number) => {
    const updatedScoreRangeInputs = [...scoreRangeInputs];
    updatedScoreRangeInputs[questionIndex] = updatedScoreRangeInputs[questionIndex].filter(
      (_, i) => i !== rangeIndex
    );
    setScoreRangeInputs(updatedScoreRangeInputs);

    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].scoreRanges = updatedScoreRangeInputs[questionIndex].map((range) => ({
      title: range.title,
      min: typeof range.min === 'number' ? range.min : 0,
      max: typeof range.max === 'number' ? range.max : 0,
    }));
    setFormData({ ...formData, questions: updatedQuestions });
  };

  return {
    scoreRangeInputs,
    setScoreRangeInputs,
    handleScoreRangeInput,
    handleScoreRangeBlur,
    addScoreRange,
    removeScoreRangeInput,
  };
}