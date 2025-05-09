'use client';

import { Component, ReactNode, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormState } from '@/hooks/useFormState';
import { useScoreRanges } from '@/hooks/useScoreRanges';
import { useCheckboxOptions } from '@/hooks/useCheckboxOptions';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { useNavigation } from '@/hooks/useNavigation';
import { FormErrors, FormData } from '@/types';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-form-bg font-roboto text-form-text flex items-center justify-center">
          <div className="bg-form-card p-6 rounded-lg border border-form-border shadow-form-card">
            <h1 className="text-xl font-bold text-form-error">Something went wrong.</h1>
            <p className="mt-2 text-form-secondary">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="mt-4 px-4 py-2 bg-form-blue text-white rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Placeholder loading component for Suspense
const FormBuilderLoading = () => (
  <div className="min-h-screen bg-form-bg flex items-center justify-center">
    <p className="text-form-text text-xl">Loading form builder...</p>
  </div>
);

// Form Preview Component
const FormPreview = ({ formData }: { formData: FormData }) => (
  <div className="bg-form-card p-6 rounded-lg border border-form-border shadow-form-card">
    <h2 className="text-xl font-bold text-form-purple mb-4">{formData.name || 'Untitled Form'}</h2>
    <p className="text-form-secondary mb-4">{formData.description || 'No description'}</p>
    {formData.questions.map((question) => (
      <div key={question.id} className="mb-4">
        <h3 className="text-form-text font-medium">
          {question.title} {question.isRequired && <span className="text-form-error">*</span>}
        </h3>
        <p className="text-sm text-form-secondary">{question.description}</p>
        {question.type === 'score' ? (
          <div className="mt-2">
            {question.scoreRanges?.map((range, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" disabled className="h-4 w-4 text-form-blue" />
                <span className="text-form-text">{range.title} ({range.min}–{range.max})</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            {question.checkboxOptions?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="h-4 w-4 text-form-blue" />
                <span className="text-form-text">{option}</span>
              </div>
            ))}
          </div>
        )}
        {question.hasComments && (
          <textarea
            className="mt-2 w-full p-2 bg-form-card border border-form-border rounded-md text-form-text"
            placeholder="Comments..."
            disabled
          />
        )}
      </div>
    ))}
  </div>
);

// Main Form Builder content component
const FormBuilderContent = () => {
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');
  const { formData, setFormData, handleBasicInfoChange, handleQuestionChange, addQuestion, removeQuestion } = useFormState();
  const { scoreRangeInputs, handleScoreRangeInput, handleScoreRangeBlur, addScoreRange, removeScoreRangeInput } = useScoreRanges(formData, setFormData);
  const { checkboxStates, newOptionInputs, handleCheckboxChange, handleNewOptionInput, addCheckboxOption, removeCheckboxOption, removeOptionInput } = useCheckboxOptions(formData, setFormData);
  const { errors, setErrors, validateForm } = useFormValidation(formData, scoreRangeInputs, newOptionInputs);
  const { isSubmitting, apiError, handleSubmit } = useFormSubmission(formData);
  const { isNavOpen, toggleNav, closeNav } = useNavigation();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        try {
          const res = await fetch(`/api/forms/${formId}`);
          if (!res.ok) throw new Error('Failed to fetch form');
          const data = await res.json();
          const formData: FormData = {
            id: data.id,
            name: data.formName,
            description: data.description,
            questions: data.questions.map((q: { id: string; title: string; questionText: string; questionType: string; scoreRanges?: { title: string; min: number; max: number }[]; options?: string[]; required: boolean; commentRequired: boolean }) => ({
              id: q.id,
              title: q.title,
              description: q.questionText,
              type: q.questionType,
              scoreRanges: q.scoreRanges,
              checkboxOptions: q.options,
              isRequired: q.required,
              hasComments: q.commentRequired,
            })),
          };
          setFormData(formData);
        } catch (error) {
          console.error('Failed to load form:', error);
        }
      };
      fetchForm();
    }
  }, [formId, setFormData]);

  // Real-time validation for form name and description
  const handleBasicInfoChangeWithErrors = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleBasicInfoChange(e);
    const { name, value } = e.target;
    setErrors((prev: FormErrors) => ({
      ...prev,
      [name]: value.trim() ? undefined : `${name.charAt(0).toUpperCase() + name.slice(1)} is required`,
    }));
  };

  // Real-time validation for question fields
  const handleQuestionChangeWithErrors = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    handleQuestionChange(index, e);
    const { name, value } = e.target;
    setErrors((prev: FormErrors) => {
      const newErrors: FormErrors = { ...prev, questions: [...prev.questions] };
      newErrors.questions[index] = {
        ...newErrors.questions[index],
        [name]: value.trim() ? undefined : `${name.charAt(0).toUpperCase() + name.slice(1)} is required`,
      };
      return newErrors;
    });
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      questions: [{ id: Math.random().toString(), title: '', description: '', type: 'score', isRequired: false, hasComments: false }],
    });
    setErrors({ questions: [] });
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-form-bg font-roboto text-form-text">
        <nav className="fixed top-0 left-0 right-0 bg-form-card text-form-text shadow-form-card z-20">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-form-purple" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm6 3a1 1 0 011 1v8a1 1 0 01-2 0V8a1 1 0 011-1z" />
              </svg>
              <h1 className="text-xl font-bold text-form-purple">Form Builder</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1 text-sm border border-form-border rounded-md hover:bg-form-blue-light hover:text-form-blue transition-colors"
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? 'Edit Form' : 'Preview Form'}
              </button>
              <Link
                href="/"
                className="px-3 py-1 text-sm hover:bg-form-blue-light hover:text-form-blue rounded-md transition-colors"
              >
                Back to Forms
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, validateForm)}
                className="px-4 py-1 bg-form-blue text-white rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all disabled:opacity-50"
                disabled={isSubmitting}
                aria-label={formData.id ? 'Update form' : 'Save form'}
              >
                {isSubmitting ? 'Saving...' : formData.id ? 'Update Form' : 'Save Form'}
              </button>
            </div>
            <button
              className="md:hidden p-2"
              onClick={toggleNav}
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
          {isNavOpen && (
            <div className="md:hidden bg-form-card px-4 py-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="block py-2 text-sm hover:bg-form-blue-light hover:text-form-blue rounded-md transition-colors"
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? 'Edit Form' : 'Preview Form'}
              </button>
              <Link
                href="/"
                className="block py-2 text-sm hover:bg-form-blue-light hover:text-form-blue rounded-md transition-colors"
                onClick={closeNav}
              >
                Back to Forms
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, validateForm)}
                className="w-full text-left py-2 text-sm bg-form-blue text-white rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all disabled:opacity-50"
                disabled={isSubmitting}
                aria-label={formData.id ? 'Update form' : 'Save form'}
              >
                {isSubmitting ? 'Saving...' : formData.id ? 'Update Form' : 'Save Form'}
              </button>
            </div>
          )}
        </nav>

        <div className="pt-20 max-w-3xl mx-auto px-4 py-6">
          {apiError && (
            <div className="mb-4 p-4 bg-red-100 border border-form-error text-form-error rounded-md">
              {apiError}
            </div>
          )}

          {showPreview ? (
            <FormPreview formData={formData} />
          ) : (
            <form onSubmit={(e) => handleSubmit(e, validateForm)}>
              <section className="mb-8 bg-form-card p-6 rounded-lg border border-form-border shadow-form-card">
                <h2 className="text-lg font-bold text-form-purple mb-4">Form Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-form-secondary">
                      Form Name
                      <span className="text-form-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleBasicInfoChangeWithErrors}
                      className={`mt-1 w-full p-2 bg-form-card border ${
                        errors.name ? 'border-form-error' : 'border-form-border'
                      } rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all`}
                      required
                      aria-describedby="name-error"
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-form-error">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-form-secondary">
                      Form Description
                      <span className="text-form-error">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleBasicInfoChangeWithErrors}
                      className={`mt-1 w-full p-2 bg-form-card border ${
                        errors.description ? 'border-form-error' : 'border-form-border'
                      } rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all`}
                      rows={3}
                      required
                      aria-describedby="description-error"
                    />
                    {errors.description && (
                      <p id="description-error" className="mt-1 text-sm text-form-error">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-lg font-bold text-form-purple">Questions</h2>
                {formData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-form-card p-6 rounded-lg border border-form-border shadow-form-card relative"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`title-${index}`}
                          className="block text-sm font-medium text-form-secondary"
                        >
                          Question Title
                          <span className="text-form-error">*</span>
                        </label>
                        <input
                          type="text"
                          id={`title-${index}`}
                          name="title"
                          value={question.title}
                          onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                          className={`mt-1 w-full p-2 bg-form-card border ${
                            errors.questions?.[index]?.title ? 'border-form-error' : 'border-form-border'
                          } rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all`}
                          required
                          aria-describedby={`title-error-${index}`}
                        />
                        {errors.questions?.[index]?.title && (
                          <p id={`title-error-${index}`} className="mt-1 text-sm text-form-error">
                            {errors.questions[index].title}
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <label
                          htmlFor={`type-${index}`}
                          className="block text-sm font-medium text-form-secondary"
                        >
                          Question Type
                        </label>
                        <select
                          id={`type-${index}`}
                          name="type"
                          value={question.type}
                          onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                          className="mt-1 w-full select-custom"
                          aria-label="Select question type"
                        >
                          <option value="score" className="select-option-hover">Score</option>
                          <option value="checkbox" className="select-option-hover">Checkbox</option>
                        </select>
                        <div className="select-arrow" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor={`description-${index}`}
                        className="block text-sm font-medium text-form-secondary"
                      >
                        Question Description
                        <span className="text-form-error">*</span>
                      </label>
                      <textarea
                        id={`description-${index}`}
                        name="description"
                        value={question.description}
                        onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                        className={`mt-1 w-full p-2 bg-form-card border ${
                          errors.questions?.[index]?.description ? 'border-form-error' : 'border-form-border'
                        } rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all`}
                        rows={2}
                        required
                        aria-describedby={`description-error-${index}`}
                      />
                      {errors.questions?.[index]?.description && (
                        <p id={`description-error-${index}`} className="mt-1 text-sm text-form-error">
                          {errors.questions[index].description}
                        </p>
                      )}
                    </div>
                    {question.type === 'score' ? (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-form-secondary">
                          Score Ranges
                          <span className="ml-1 text-sm text-form-secondary">(e.g., Low: 1–3, High: 4–5)</span>
                        </label>
                        {errors.questions?.[index]?.scoreRanges && (
                          <p className="mt-1 text-sm text-form-error">
                            {errors.questions[index].scoreRanges}
                          </p>
                        )}
                        <div className="mt-2 space-y-4">
                          {scoreRangeInputs[index]?.map((range, rangeIndex) => (
                            <div key={rangeIndex} className="flex items-center space-x-2">
                              <div className="flex-1">
                                <label
                                  htmlFor={`range-title-${index}-${rangeIndex}`}
                                  className="block text-sm font-medium text-form-secondary"
                                >
                                  Range Title
                                </label>
                                <input
                                  type="text"
                                  id={`range-title-${index}-${rangeIndex}`}
                                  value={range.title}
                                  onChange={(e) =>
                                    handleScoreRangeInput(index, rangeIndex, 'title', e.target.value)
                                  }
                                  className="mt-1 w-full p-2 bg-form-card border border-form-border rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all"
                                  placeholder={`Range ${rangeIndex + 1} Title`}
                                  aria-label={`Score range ${rangeIndex + 1} title`}
                                />
                              </div>
                              <div className="w-20">
                                <label
                                  htmlFor={`min-${index}-${rangeIndex}`}
                                  className="block text-sm font-medium text-form-secondary"
                                >
                                  Start Range
                                </label>
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  id={`min-${index}-${rangeIndex}`}
                                  value={range.min === '' ? '' : range.min}
                                  onChange={(e) =>
                                    handleScoreRangeInput(index, rangeIndex, 'min', e.target.value)
                                  }
                                  onBlur={() => handleScoreRangeBlur(index, rangeIndex, 'min')}
                                  className="mt-1 w-full p-2 bg-form-card border border-form-border rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all"
                                  placeholder="Start"
                                  aria-label={`Score range ${rangeIndex + 1} start`}
                                />
                              </div>
                              <div className="w-20">
                                <label
                                  htmlFor={`max-${index}-${rangeIndex}`}
                                  className="block text-sm font-medium text-form-secondary"
                                >
                                  End Range
                                </label>
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  id={`max-${index}-${rangeIndex}`}
                                  value={range.max === '' ? '' : range.max}
                                  onChange={(e) =>
                                    handleScoreRangeInput(index, rangeIndex, 'max', e.target.value)
                                  }
                                  onBlur={() => handleScoreRangeBlur(index, rangeIndex, 'max')}
                                  className="mt-1 w-full p-2 bg-form-card border border-form-border rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all"
                                  placeholder="End"
                                  aria-label={`Score range ${rangeIndex + 1} end`}
                                />
                              </div>
                              {rangeIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeScoreRangeInput(index, rangeIndex)}
                                  className="w-8 h-8 flex items-center justify-center border border-form-border text-form-secondary rounded-full hover:bg-form-blue-light hover:text-form-blue transition-all"
                                  aria-label={`Remove score range ${rangeIndex + 1}`}
                                >
                                  −
                                </button>
                              )}
                              {rangeIndex === scoreRangeInputs[index].length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => addScoreRange(index)}
                                  className="w-8 h-8 flex items-center justify-center border border-form-border text-form-secondary rounded-full hover:bg-form-blue-light hover:text-form-blue transition-all"
                                  aria-label="Add score range"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-form-secondary">
                          Checkbox Options
                          <span className="ml-1 text-sm text-form-secondary">(e.g., Option 1, Option 2)</span>
                        </label>
                        {errors.questions?.[index]?.options && (
                          <p className="mt-1 text-sm text-form-error">
                            {errors.questions[index].options}
                          </p>
                        )}
                        <div className="mt-2 space-y-2">
                          {newOptionInputs[index]?.map((input, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={input}
                                onChange={(e) =>
                                  handleNewOptionInput(index, optionIndex, e.target.value)
                                }
                                className="flex-1 p-2 bg-form-card border border-form-border rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all"
                                placeholder={`Option ${optionIndex + 1}`}
                                aria-label={`Checkbox option ${optionIndex + 1}`}
                              />
                              {optionIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeOptionInput(index, optionIndex)}
                                  className="w-8 h-8 flex items-center justify-center border border-form-border rounded-full text-form-secondary hover:bg-form-blue-light hover:text-form-blue transition-all"
                                  aria-label={`Remove checkbox option ${optionIndex + 1}`}
                                >
                                  −
                                </button>
                              )}
                              {optionIndex === newOptionInputs[index].length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => addCheckboxOption(index)}
                                  className="w-8 h-8 flex items-center justify-center border border-form-border rounded-full text-form-secondary hover:bg-form-blue-light hover:text-form-blue transition-all"
                                  aria-label="Add checkbox option"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.checkboxOptions && Array.isArray(question.checkboxOptions) && question.checkboxOptions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {question.checkboxOptions.map((option: string, i: number) => (
                              <div key={i} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[index][i]}
                                  onChange={() => handleCheckboxChange(index, i)}
                                  className="h-4 w-4 text-form-blue border-form-border rounded focus:ring-form-blue"
                                  aria-label={`Checkbox option: ${option}`}
                                />
                                <span className="text-form-text">{option}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCheckboxOption(index, i)}
                                  className="w-8 h-8 flex items-center justify-center border border-form-border text-form-secondary rounded-full hover:bg-form-blue-light hover:text-form-blue transition-all"
                                  aria-label={`Remove checkbox option: ${option}`}
                                >
                                  −
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isRequired"
                          checked={question.isRequired}
                          onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                          className="h-4 w-4 text-form-blue border-form-border rounded focus:ring-form-blue"
                          aria-label="Mark question as required"
                        />
                        <span className="ml-2 text-sm text-form-secondary">Required</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="hasComments"
                          checked={question.hasComments}
                          onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                          className="h-4 w-4 text-form-blue border-form-border rounded focus:ring-form-blue"
                          aria-label="Allow comments for question"
                        />
                        <span className="ml-2 text-sm text-form-secondary">Allow Comments</span>
                      </label>
                    </div>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index, setErrors)}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-form-border text-form-secondary rounded-full hover:bg-form-blue-light hover:text-form-blue transition-all"
                        aria-label="Remove question"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="w-12 h-12 bg-form-blue text-white rounded-full hover:bg-form-blue-light hover:text-form-blue transition-all"
                    aria-label="Add new question"
                  >
                    +
                  </button>
                </div>
              </section>

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 border border-form-border text-form-secondary rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all"
                  aria-label="Clear form"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-form-blue text-white rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all disabled:opacity-50 relative"
                  disabled={isSubmitting}
                  aria-label={formData.id ? 'Update form' : 'Save form'}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    formData.id ? 'Update Form' : 'Save Form'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
};

// Default export wrapped in Suspense
export default function FormBuilder() {
  return (
    <Suspense fallback={<FormBuilderLoading />}>
      <FormBuilderContent />
    </Suspense>
  );
}