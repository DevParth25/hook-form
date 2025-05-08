export interface FormData {
    id?: string;
    name: string;
    description: string;
    questions: Array<{
      id: string;
      title: string;
      description: string;
      type: 'score' | 'checkbox';
      scoreRanges?: Array<{ title: string; min: number; max: number }>;
      checkboxOptions?: string[];
      isRequired: boolean;
      hasComments: boolean;
    }>;
  }
  
  export interface Form {
    id: string;
    formName: string;
    description: string;
    questions: Array<{
      id: string;
      title: string;
      questionText: string;
      questionType: 'score' | 'checkbox';
      scoreRanges?: Array<{ title: string; min: number; max: number }>;
      options?: string[];
      required: boolean;
      commentRequired: boolean;
    }>;
  }
  
  export interface FormErrors {
    name?: string;
    description?: string;
    questions: Array<{
      title?: string;
      description?: string;
      scoreRanges?: string;
      options?: string;
    }>;
  }