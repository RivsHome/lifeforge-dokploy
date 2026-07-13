import z from 'zod'

import { schemaWithPB } from '@lifeforge/server-utils'

import forge from '../forge'
import achievementsSchemas from '../schema'

export const list = forge
  .query({
    description: 'Get the list of achievement categories',
    output: {
      OK: z.array(achievementsSchemas.categories_aggregated)
    }
  })
  .callback(async function ({ pb, response }) {
    const result = await pb.getFullList
      .collection('categories_aggregated')
      .execute()

    return response.ok(result)
  })

export const create = forge
  .mutation({
    description: 'Create a new achievement category',
    input: {
      body: achievementsSchemas.categories.pick({
        name: true,
        icon: true,
        color: true
      })
    },
    output: {
      CREATED: achievementsSchemas.categories,
      CONFLICT: true
    }
  })
  .callback(async function ({ pb, body, response }) {
    let existingCategory = null

    existingCategory = await pb.getFirstListItem
      .collection('categories')
      .filter([{ field: 'name', operator: '=', value: body.name }])
      .execute()
      .catch(() => {})

    if (existingCategory) {
      return response.conflict()
    }

    const result = await pb.create.collection('categories').data(body).execute()

    return response.created(result)
  })

export const update = forge
  .mutation({
    description: 'Update an existing achievement category',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: achievementsSchemas.categories.pick({
        name: true,
        icon: true,
        color: true
      })
    },
    existenceCheck: {
      query: {
        id: 'categories'
      }
    },
    output: {
      OK: schemaWithPB(achievementsSchemas.categories),
      CONFLICT: true,
      NOT_FOUND: true
    }
  })
  .callback(async function ({ pb, query: { id }, body, response }) {
    let existingCategory = null

    existingCategory = await pb.getFirstListItem
      .collection('categories')
      .filter([
        { field: 'name', operator: '=', value: body.name },
        { field: 'id', operator: '!=', value: id }
      ])
      .execute()
      .catch(() => {})

    if (existingCategory) {
      return response.conflict()
    }

    const result = await pb.update
      .collection('categories')
      .id(id)
      .data(body)
      .execute()

    return response.ok(result)
  })

export const remove = forge
  .mutation({
    description: 'Delete an achievement category',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: {
        id: 'categories'
      }
    },
    output: {
      OK: z.boolean(),
      NOT_FOUND: true
    }
  })
  .callback(async function ({ pb, query: { id }, response }) {
    const result = await pb.delete.collection('categories').id(id).execute()

    return response.ok(result)
  })
