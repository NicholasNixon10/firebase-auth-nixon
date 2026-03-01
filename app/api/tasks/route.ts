import { NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/dummyData';

// GET /api/tasks – return all tasks
export async function GET() {
  try {
    const tasks = getTasks();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks – create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // Basic validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newTask = createTask({ title, description });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}