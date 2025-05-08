'use client';

import { Component, ReactNode, useEffect } from 'react';
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
        <div className="min-h-screen bg-gradient-to-b from-deep-purple to-teal font-sans text-white flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink">
            <h1 className="text-xl font-orbitron text-neon-pink">Something went wrong.</h1>
            <p className="mt-2 text-neon-cyan">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="mt-4 px-4 py-2 bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all"
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

export default function FormBuilder() {
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');
  const { formData, setFormData, handleBasicInfoChange, handleQuestionChange, addQuestion, removeQuestion } = useFormState();
  const { scoreRangeInputs, handleScoreRangeInput, handleScoreRangeBlur, addScoreRange, removeScoreRangeInput } = useScoreRanges(formData, setFormData);
  const { checkboxStates, newOptionInputs, handleCheckboxChange, handleNewOptionInput, addCheckboxOption, removeCheckboxOption, removeOptionInput } = useCheckboxOptions(formData, setFormData);
  const { errors, setErrors, validateForm } = useFormValidation(formData, scoreRangeInputs, newOptionInputs);
  const { isSubmitting, apiError, handleSubmit } = useFormSubmission(formData);
  const { isNavOpen, toggleNav, closeNav } = useNavigation();

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

  // Modified handleBasicInfoChange to clear errors
  const handleBasicInfoChangeWithErrors = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleBasicInfoChange(e);
    setErrors((prev: FormErrors) => ({
      ...prev,
      [e.target.name]: undefined,
    }));
  };

  // Modified handleQuestionChange to clear question-specific errors
  const handleQuestionChangeWithErrors = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    handleQuestionChange(index, e);
    const name = e.target.name;
    setErrors((prev: FormErrors) => {
      const newErrors: FormErrors = { ...prev, questions: [...prev.questions] };
      newErrors.questions[index] = { ...newErrors.questions[index], [name]: undefined };
      return newErrors;
    });
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-deep-purple to-teal font-sans text-white">
        <nav className="fixed top-0 left-0 right-0 bg-deep-purple text-white shadow-lg z-20">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
              Form Builder
            </h1>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/forms"
                className="px-3 py-1 text-sm hover:bg-neon-pink hover:text-white rounded-md transition-colors"
              >
                Back to Forms
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, validateForm)}
                className="px-4 py-1 bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : formData.id ? 'Update Form' : 'Save Form'}
              </button>
            </div>
            <button
              className="md:hidden p-2"
              onClick={toggleNav}
              aria-label="Toggle Navigation"
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
            <div className="md:hidden bg-deep-purple/90 px-4 py-2">
              <Link
                href="/forms"
                className="block py-2 text-sm hover:bg-neon-pink hover:text-white rounded-md transition-colors"
                onClick={closeNav}
              >
                Back to Forms
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, validateForm)}
                className="w-full text-left py-2 text-sm bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : formData.id ? 'Update Form' : 'Save Form'}
              </button>
            </div>
          )}
        </nav>

        <div className="pt-20 max-w-3xl mx-auto px-4 py-6">
          {apiError && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-500 rounded-md backdrop-blur-md">
              {apiError}
            </div>
          )}
          <form onSubmit={(e) => handleSubmit(e, validateForm)}>
            <section className="mb-8 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink">
              <h2 className="text-lg font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-4">
                Form Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neon-cyan">
                    Form Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicInfoChangeWithErrors}
                    className={`mt-1 w-full p-2 bg-white/5 border ${
                      errors.name ? 'border-red-500' : 'border-neon-pink'
                    } rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all`}
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neon-cyan">
                    Form Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleBasicInfoChangeWithErrors}
                    className={`mt-1 w-full p-2 bg-white/5 border ${
                      errors.description ? 'border-red-500' : 'border-neon-pink'
                    } rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all`}
                    rows={3}
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                Questions
              </h2>
              {formData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink relative"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`title-${index}`}
                        className="block text-sm font-medium text-neon-cyan"
                      >
                        Question Title
                      </label>
                      <input
                        type="text"
                        id={`title-${index}`}
                        name="title"
                        value={question.title}
                        onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                        className={`mt-1 w-full p-2 bg-white/5 border ${
                          errors.questions?.[index]?.title ? 'border-red-500' : 'border-neon-pink'
                        } rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all`}
                        required
                      />
                      {errors.questions?.[index]?.title && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.questions[index].title}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label
                        htmlFor={`type-${index}`}
                        className="block text-sm font-medium text-neon-cyan"
                      >
                        Question Type
                      </label>
                      <select
                        id={`type-${index}`}
                        name="type"
                        value={question.type}
                        onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                        className="mt-1 w-full select-custom"
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
                      className="block text-sm font-medium text-neon-cyan"
                    >
                      Question Description
                    </label>
                    <textarea
                      id={`description-${index}`}
                      name="description"
                      value={question.description}
                      onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                      className={`mt-1 w-full p-2 bg-white/5 border ${
                        errors.questions?.[index]?.description ? 'border-red-500' : 'border-neon-pink'
                      } rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all`}
                      rows={2}
                      required
                    />
                    {errors.questions?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.questions[index].description}
                      </p>
                    )}
                  </div>
                  {question.type === 'score' ? (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neon-cyan">
                        Score Ranges
                      </label>
                      {errors.questions?.[index]?.scoreRanges && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.questions[index].scoreRanges}
                        </p>
                      )}
                      <div className="mt-2 space-y-4">
                        {scoreRangeInputs[index]?.map((range, rangeIndex) => (
                          <div key={rangeIndex} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <label
                                htmlFor={`range-title-${index}-${rangeIndex}`}
                                className="block text-sm font-medium text-neon-cyan"
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
                                className="mt-1 w-full p-2 bg-white/5 border border-neon-pink rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all"
                                placeholder={`Range ${rangeIndex + 1} Title`}
                              />
                            </div>
                            <div className="w-20">
                              <label
                                htmlFor={`min-${index}-${rangeIndex}`}
                                className="block text-sm font-medium text-neon-cyan"
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
                                className="mt-1 w-full p-2 bg-white/5 border border-neon-pink rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all"
                                placeholder="Start Range"
                              />
                            </div>
                            <div className="w-20">
                              <label
                                htmlFor={`max-${index}-${rangeIndex}`}
                                className="block text-sm font-medium text-neon-cyan"
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
                                className="mt-1 w-full p-2 bg-white/5 border border-neon-pink rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all"
                                placeholder="End Range"
                              />
                            </div>
                            {rangeIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => removeScoreRangeInput(index, rangeIndex)}
                                className="w-8 h-8 flex items-center justify-center border border-neon-pink text-neon-pink rounded-full hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                                aria-label="Remove Score Range"
                              >
                                −
                              </button>
                            )}
                            {rangeIndex === scoreRangeInputs[index].length - 1 && (
                              <button
                                type="button"
                                onClick={() => addScoreRange(index)}
                                className="w-8 h-8 flex items-center justify-center border border-neon-pink text-neon-pink rounded-full hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                                aria-label="Add Score Range"
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
                      <label className="block text-sm font-medium text-neon-cyan">
                        Checkbox Options
                      </label>
                      {errors.questions?.[index]?.options && (
                        <p className="mt-1 text-sm text-red-500">
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
                              className="flex-1 p-2 bg-white/5 border border-neon-pink rounded-md text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan focus:shadow-neon-cyan transition-all"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            {optionIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => removeOptionInput(index, optionIndex)}
                                className="w-8 h-8 flex items-center justify-center border border-neon-pink rounded-full text-neon-pink hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                                aria-label="Remove Checkbox Option"
                              >
                                −
                              </button>
                            )}
                            {optionIndex === newOptionInputs[index].length - 1 && (
                              <button
                                type="button"
                                onClick={() => addCheckboxOption(index)}
                                className="w-8 h-8 flex items-center justify-center border border-neon-pink rounded-full text-neon-pink hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                                aria-label="Add Checkbox Option"
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
                                className="h-4 w-4 text-neon-pink border-neon-pink rounded focus:ring-neon-cyan focus:shadow-neon-cyan"
                              />
                              <span className="text-white">{option}</span>
                              <button
                                type="button"
                                onClick={() => removeCheckboxOption(index, i)}
                                className="w-8 h-8 flex items-center justify-center border border-neon-pink text-neon-pink rounded-full hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                                aria-label="Remove Checkbox Option"
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
                        className="h-4 w-4 text-neon-pink border-neon-pink rounded focus:ring-neon-cyan focus:shadow-neon-cyan"
                      />
                      <span className="ml-2 text-sm text-neon-cyan">Required</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasComments"
                        checked={question.hasComments}
                        onChange={(e) => handleQuestionChangeWithErrors(index, e)}
                        className="h-4 w-4 text-neon-pink border-neon-pink rounded focus:ring-neon-cyan focus:shadow-neon-cyan"
                      />
                      <span className="ml-2 text-sm text-neon-cyan">Allow Comments</span>
                    </label>
                  </div>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index, setErrors)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border border-neon-pink text-neon-pink rounded-full hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
                      aria-label="Remove Question"
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
                  className="w-12 h-12 bg-neon-pink text-white rounded-full hover:bg-neon-pink/80 hover:shadow-neon-pink-lg transition-all"
                  aria-label="Add Question"
                >
                  +
                </button>
              </div>
            </section>

            <div className="mt-8 text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink-lg transition-all disabled:opacity-50 relative"
                disabled={isSubmitting}
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
        </div>
      </main>
    </ErrorBoundary>
  );
}