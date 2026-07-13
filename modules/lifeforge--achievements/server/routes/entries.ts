import z from 'zod'

import forge from '../forge'
import achievementsSchemas from '../schema'

export const list = forge
  .query({
    description:
      'Get the list of achievement entries with optional filtering by difficulty, category, or search query',
    input: {
      query: z.object({
        difficulty: achievementsSchemas.entries.shape.difficulty
          .optional()
          .nullable(),
        category: z.string().optional(),
        query: z.string().optional()
      })
    },
    existenceCheck: {
      query: {
        category: '[categories]'
      }
    },
    output: {
      OK: z.array(achievementsSchemas.entries),
      NOT_FOUND: true
    }
  })
  .callback(async function ({
    pb,
    query: { difficulty, category, query },
    response
  }) {
    const result = await pb.getFullList
      .collection('entries')
      .filter([
        difficulty && {
          field: 'difficulty',
          operator: '=',
          value: difficulty
        },
        category
          ? {
              field: 'category',
              operator: '=',
              value: category
            }
          : undefined,
        query
          ? {
              combination: '||',
              filters: [
                {
                  field: 'title',
                  operator: '~',
                  value: query
                },
                {
                  field: 'thoughts',
                  operator: '~',
                  value: query
                }
              ]
            }
          : undefined
      ])
      .sort(['-created'])
      .execute()

    return response.ok(result)
  })

export const difficultiesCount = forge
  .query({
    description: 'Get the count of achievement entries grouped by difficulty',
    output: {
      OK: z.record(z.string(), z.number())
    }
  })
  .callback(async function ({ pb, response }) {
    const listItems = await pb.getFullList
      .collection('difficulties_aggregated')
      .execute()

    const result = Object.fromEntries(
      listItems.map(item => [item.difficulty, item.count])
    ) as Record<string, number>

    return response.ok(result)
  })

export const create = forge
  .mutation({
    description: 'Create a new achievements entry',
    input: {
      body: achievementsSchemas.entries
        .pick({
          title: true,
          thoughts: true,
          difficulty: true
        })
        .extend({
          category: z.string().optional()
        })
    },
    output: {
      CREATED: achievementsSchemas.entries
    }
  })
  .callback(async function ({ pb, body, response }) {
    const result = await pb.create.collection('entries').data(body).execute()

    return response.created(result)
  })

export const update = forge
  .mutation({
    description: 'Update an existing achievements entry',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: achievementsSchemas.entries
        .pick({
          title: true,
          thoughts: true,
          difficulty: true
        })
        .extend({
          category: z.string().optional()
        })
    },
    existenceCheck: {
      query: {
        id: 'entries'
      }
    },
    output: {
      OK: achievementsSchemas.entries,
      NOT_FOUND: true
    }
  })
  .callback(async function ({ pb, query: { id }, body, response }) {
    const result = await pb.update
      .collection('entries')
      .id(id)
      .data(body)
      .execute()

    return response.ok(result)
  })

export const remove = forge
  .mutation({
    description: 'Delete an achievements entry',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: {
        id: 'entries'
      }
    },
    output: {
      NO_CONTENT: true,
      NOT_FOUND: true
    }
  })
  .callback(async function ({ pb, query: { id }, response }) {
    await pb.delete.collection('entries').id(id).execute()

    return response.noContent()
  })
