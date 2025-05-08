import { NextRequest, NextResponse } from 'next/server';

// GET handler for fetching a form by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await context.params;

    // Validate the ID (optional, but recommended)
    if (!id) {
      return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
    }

    // Your logic to fetch the form (e.g., from a database)
    // Replace this with your actual data fetching logic
    const form = await fetchFormById(id); // Example placeholder function

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Placeholder function for fetching a form by ID
// Replace this with your actual data fetching logic (e.g., Prisma, Mongoose, etc.)
async function fetchFormById(id: string) {
  // Example: Fetch from a database
  return { id, title: 'Sample Form', fields: [] }; // Mock data
}