import { useState } from 'react';
import { FormData } from '@/types';

interface UseCheckboxOptions {
  checkboxStates: boolean[][];
  newOptionInputs: string[][];
  handleCheckboxChange: (questionIndex: number, checkboxIndex: number) => void;
  handleNewOptionInput: (questionIndex: number, optionIndex: number, value: string) => void;
  addCheckboxOption: (questionIndex: number) => void;
  removeCheckboxOption: (questionIndex: number, optionIndex: number) => void;
  removeOptionInput: (questionIndex: number, optionIndex: number) => void;
}

export function useCheckboxOptions(formData: FormData, setFormData: (data: FormData) => void): UseCheckboxOptions {
  const [checkboxStates, setCheckboxStates] = useState<boolean[][]>(
    formData.questions.map(() => [])
  );
  const [newOptionInputs, setNewOptionInputs] = useState<string[][]>(
    formData.questions.map(() => [''])
  );

  const handleCheckboxChange = (questionIndex: number, checkboxIndex: number) => {
    const updatedCheckboxStates = [...checkboxStates];
    updatedCheckboxStates[questionIndex][checkboxIndex] =
      !updatedCheckboxStates[questionIndex][checkboxIndex];
    setCheckboxStates(updatedCheckboxStates);
  };

  const handleNewOptionInput = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedNewOptionInputs = [...newOptionInputs];
    updatedNewOptionInputs[questionIndex][optionIndex] = value;
    setNewOptionInputs(updatedNewOptionInputs);
  };

  const addCheckboxOption = (questionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const currentOptions = newOptionInputs[questionIndex]
      .map((input) => input.trim())
      .filter((input) => input !== '');

    updatedQuestions[questionIndex].checkboxOptions = currentOptions;

    const updatedNewOptionInputs = [...newOptionInputs];
    updatedNewOptionInputs[questionIndex] = [...currentOptions, ''];
    setNewOptionInputs(updatedNewOptionInputs);

    const updatedCheckboxStates = [...checkboxStates];
    updatedCheckboxStates[questionIndex] = currentOptions.map(() => false);
    setCheckboxStates(updatedCheckboxStates);

    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeCheckboxOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].checkboxOptions = updatedQuestions[
      questionIndex
    ].checkboxOptions!.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, questions: updatedQuestions });

    const updatedCheckboxStates = [...checkboxStates];
    updatedCheckboxStates[questionIndex] = updatedCheckboxStates[questionIndex].filter(
      (_, i) => i !== optionIndex
    );
    setCheckboxStates(updatedCheckboxStates);

    const updatedNewOptionInputs = [...newOptionInputs];
    updatedNewOptionInputs[questionIndex] = updatedNewOptionInputs[questionIndex].filter(
      (_, i) => i !== optionIndex
    );
    setNewOptionInputs(updatedNewOptionInputs);
  };

  const removeOptionInput = (questionIndex: number, optionIndex: number) => {
    const updatedNewOptionInputs = [...newOptionInputs];
    updatedNewOptionInputs[questionIndex] = updatedNewOptionInputs[questionIndex].filter(
      (_, i) => i !== optionIndex
    );
    setNewOptionInputs(updatedNewOptionInputs);
  };

  return {
    checkboxStates,
    newOptionInputs,
    handleCheckboxChange,
    handleNewOptionInput,
    addCheckboxOption,
    removeCheckboxOption,
    removeOptionInput,
  };
}