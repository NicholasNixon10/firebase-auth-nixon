import { NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/dummyData';

// GET /api/tasks/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // Validation (allow partial updates)
    if (!title && !description) {
      return NextResponse.json(
        { error: 'At least one field (title or description) is required' },
        { status: 400 }
      );
    }

    const updatedTask = updateTask(params.id, { title, description });
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteTask(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}