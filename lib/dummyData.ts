export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// Initial dummy tasks
let tasks: Task[] = [
  {
    id: '1',
    title: 'Learn Next.js API routes',
    description: 'Build REST endpoints with best practices',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Add Swagger documentation',
    description: 'Make API explorable via /docs',
    createdAt: new Date().toISOString(),
  },
];

// Helper functions to manipulate tasks (simulate DB)
export const getTasks = () => tasks;

export const getTaskById = (id: string) => tasks.find(t => t.id === id);

export const createTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
  const newTask: Task = {
    id: Date.now().toString(), // simple id generation
    ...task,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates };
  return tasks[index];
};

export const deleteTask = (id: string) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};