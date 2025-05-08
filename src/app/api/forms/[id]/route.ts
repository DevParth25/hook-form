import { NextRequest, NextResponse } from 'next/server';
import { Form } from '@/types';

// Initialize globalThis.forms if it doesn't exist
if (!globalThis.forms) {
  globalThis.forms = [];
}

// Use the typed global forms array
const forms: Form[] = globalThis.forms;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const form = forms.find((f) => f.id === params.id);
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }
  return NextResponse.json(form, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const index = forms.findIndex((f) => f.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }
  const updatedForm: Form = {
    id: params.id,
    formName: body.formName,
    description: body.description,
    questions: body.questions.map((q: { id: string; title: string; questionText: string; questionType: string; scoreRanges?: { title: string; min: number; max: number }[]; options?: string[]; required: boolean; commentRequired: boolean }) => ({
      id: q.id,
      title: q.title,
      questionText: q.questionText,
      questionType: q.questionType,
      scoreRanges: q.scoreRanges,
      options: q.options,
      required: q.required,
      commentRequired: q.commentRequired,
    })),
  };
  forms[index] = updatedForm;
  return NextResponse.json(updatedForm, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const index = forms.findIndex((f) => f.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }
  forms.splice(index, 1);
  return NextResponse.json({ message: 'Form deleted' }, { status: 200 });
}