export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Tasks API',
    version: '1.0.0',
    description: 'A simple CRUD API for tasks (dummy data)',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local server',
    },
  ],
  paths: {
    '/tasks': {
      get: {
        summary: 'Get all tasks',
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
      post: {
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string', example: 'New task' },
                  description: { type: 'string', example: 'Task details' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get a task by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Task found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          404: { description: 'Task not found' },
        },
      },
      put: {
        summary: 'Update a task',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          400: { description: 'Validation error' },
          404: { description: 'Task not found' },
        },
      },
      delete: {
        summary: 'Delete a task',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: { description: 'Task deleted (no content)' },
          404: { description: 'Task not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          title: { type: 'string', example: 'Learn Next.js' },
          description: { type: 'string', example: 'Build APIs' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};