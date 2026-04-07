import { z } from 'zod'
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

// Schemas must be imported AFTER extendZodWithOpenApi is called.
// Using dynamic imports to guarantee execution order.
async function loadSchemas() {
  const [task, user, category, achievement, storeItem] = await Promise.all([
    import('./schemas/task'),
    import('./schemas/user'),
    import('./schemas/category'),
    import('./schemas/achievement'),
    import('./schemas/store-item'),
  ])
  return { task, user, category, achievement, storeItem }
}

// ── Common params / responses ─────────────────────────────────────────────────

const idParam = z.object({
  id: z.string().openapi({ example: 'clxxxxxxxxxxxxxx' }),
})

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: z.object({ error: z.string() }),
    },
  },
})

const commonErrors = {
  400: errorResponse('Validation error'),
  401: errorResponse('Unauthorized'),
}

const commonErrorsWithNotFound = {
  ...commonErrors,
  404: errorResponse('Not found'),
}

// ── Generator ─────────────────────────────────────────────────────────────────

export async function generateDocument() {
  const { task, user, category, achievement, storeItem } = await loadSchemas()

  const registry = new OpenAPIRegistry()

  // Register schemas
  const CreateTaskSchema = registry.register('CreateTask', task.createTaskSchema)
  const UpdateTaskSchema = registry.register('UpdateTask', task.updateTaskSchema)
  const CreateUserSchema = registry.register('CreateUser', user.createUserSchema)
  const CreateCategorySchema = registry.register('CreateCategory', category.createCategorySchema)
  const UpdateCategorySchema = registry.register('UpdateCategory', category.updateCategorySchema)
  const CreateAchievementSchema = registry.register('CreateAchievement', achievement.createAchievementSchema)
  const UpdateAchievementSchema = registry.register('UpdateAchievement', achievement.updateAchievementSchema)
  const CreateStoreItemSchema = registry.register('CreateStoreItem', storeItem.createStoreItemSchema)
  const UpdateStoreItemSchema = registry.register('UpdateStoreItem', storeItem.updateStoreItemSchema)

  // ── Tasks ───────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/tasks',
    summary: 'Create a task',
    tags: ['Tasks'],
    request: {
      body: {
        content: { 'application/json': { schema: CreateTaskSchema } },
      },
    },
    responses: {
      201: {
        description: 'Task created',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrors,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/tasks/{id}',
    summary: 'Update a task',
    tags: ['Tasks'],
    request: {
      params: idParam,
      body: {
        content: { 'application/json': { schema: UpdateTaskSchema } },
      },
    },
    responses: {
      200: {
        description: 'Task updated',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrorsWithNotFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/tasks/{id}',
    summary: 'Delete a task',
    tags: ['Tasks'],
    request: {
      params: idParam,
    },
    responses: {
      200: { description: 'Task deleted' },
      ...commonErrorsWithNotFound,
    },
  })

  // ── Users ───────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/users',
    summary: 'Create a user',
    tags: ['Users'],
    request: {
      body: {
        content: { 'application/json': { schema: CreateUserSchema } },
      },
    },
    responses: {
      201: {
        description: 'User created',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrors,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/users/{id}',
    summary: 'Delete a user',
    tags: ['Users'],
    request: {
      params: idParam,
    },
    responses: {
      200: { description: 'User deleted' },
      ...commonErrorsWithNotFound,
    },
  })

  // ── Categories ──────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/settings/categories',
    summary: 'Create a category',
    tags: ['Categories'],
    request: {
      body: {
        content: { 'application/json': { schema: CreateCategorySchema } },
      },
    },
    responses: {
      201: {
        description: 'Category created',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrors,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/settings/categories/{id}',
    summary: 'Update a category',
    tags: ['Categories'],
    request: {
      params: idParam,
      body: {
        content: { 'application/json': { schema: UpdateCategorySchema } },
      },
    },
    responses: {
      200: {
        description: 'Category updated',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrorsWithNotFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/settings/categories/{id}',
    summary: 'Delete a category',
    tags: ['Categories'],
    request: {
      params: idParam,
    },
    responses: {
      200: { description: 'Category deleted' },
      ...commonErrorsWithNotFound,
    },
  })

  // ── Achievements ────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/settings/achievements',
    summary: 'Create an achievement',
    tags: ['Achievements'],
    request: {
      body: {
        content: { 'application/json': { schema: CreateAchievementSchema } },
      },
    },
    responses: {
      201: {
        description: 'Achievement created',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrors,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/settings/achievements/{id}',
    summary: 'Update an achievement',
    tags: ['Achievements'],
    request: {
      params: idParam,
      body: {
        content: { 'application/json': { schema: UpdateAchievementSchema } },
      },
    },
    responses: {
      200: {
        description: 'Achievement updated',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrorsWithNotFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/settings/achievements/{id}',
    summary: 'Delete an achievement',
    tags: ['Achievements'],
    request: {
      params: idParam,
    },
    responses: {
      200: { description: 'Achievement deleted' },
      ...commonErrorsWithNotFound,
    },
  })

  // ── Store ───────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/store',
    summary: 'Create a store item',
    tags: ['Store'],
    request: {
      body: {
        content: { 'application/json': { schema: CreateStoreItemSchema } },
      },
    },
    responses: {
      201: {
        description: 'Store item created',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrors,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/store/{id}',
    summary: 'Update a store item',
    tags: ['Store'],
    request: {
      params: idParam,
      body: {
        content: { 'application/json': { schema: UpdateStoreItemSchema } },
      },
    },
    responses: {
      200: {
        description: 'Store item updated',
        content: { 'application/json': { schema: z.object({ id: z.string() }) } },
      },
      ...commonErrorsWithNotFound,
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/store/{id}',
    summary: 'Delete a store item',
    tags: ['Store'],
    request: {
      params: idParam,
    },
    responses: {
      200: { description: 'Store item deleted' },
      ...commonErrorsWithNotFound,
    },
  })

  // Generate document
  const generator = new OpenApiGeneratorV31(registry.definitions)

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Chore Quest API',
      version: '1.1.0',
      description: 'REST API for Chore Quest — a gamified household task manager.',
    },
  })
}
