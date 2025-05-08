import { NextRequest, NextResponse } from 'next/server';
import { Form } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Simulate a database with an in-memory array
const forms: Form[] = [];

export async function GET() {
  return NextResponse.json(forms, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newForm: Form = {
    id: uuidv4(),
    formName: body.formName,
    description: body.description,
    questions: body.questions.map((q: { id?: string; title: string; questionText: string; questionType: string; scoreRanges?: { title: string; min: number; max: number }[]; options?: string[]; required: boolean; commentRequired: boolean }) => ({
      id: q.id || uuidv4(),
      title: q.title,
      questionText: q.questionText,
      questionType: q.questionType,
      scoreRanges: q.scoreRanges,
      options: q.options,
      required: q.required,
      commentRequired: q.commentRequired,
    })),
  };
  forms.push(newForm);
  return NextResponse.json(newForm, { status: 201 });
}