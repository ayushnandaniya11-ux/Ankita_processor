import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'
import vine from '@vinejs/vine'
import ActivityLogService from '#services/activity_log_service'
import db from '@adonisjs/lucid/services/db'

export default class RolesController {
  public async index({ response }: HttpContext) {
    const roles = await Role.query().preload('permissions')
    return response.ok({ data: roles })
  }

  public async permissions({ response }: HttpContext) {
    const permissions = await Permission.query()
    return response.ok({ data: permissions })
  }

  public async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const schema = vine.object({
      name: vine.string().trim(),
      description: vine.string().optional(),
      permissionIds: vine.array(vine.number()).optional(),
    })

    const payload = await request.validateUsing(vine.compile(schema))

    const existing = await Role.findBy('name', payload.name)
    if (existing) {
      return response.badRequest({ error: 'Role with this name already exists' })
    }

    const trx = await db.transaction()

    try {
      const role = new Role()
      role.name = payload.name
      role.description = payload.description || null
      role.useTransaction(trx)
      await role.save()

      if (payload.permissionIds && payload.permissionIds.length > 0) {
        await role.related('permissions').attach(payload.permissionIds)
      }

      await trx.commit()

      ActivityLogService.log(
        user.id,
        'CREATE_ROLE',
        'ROLE_MANAGEMENT',
        `Created role ${role.name}`,
        request.ip()
      )

      await role.load('permissions')

      return response.created({ data: role })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ error: 'Failed to create role' })
    }
  }

  public async update({ params, request, response, auth }: HttpContext) {
    const user = auth.user!

    const role = await Role.find(params.id)
    if (!role) {
      return response.notFound({ error: 'Role not found' })
    }

    const schema = vine.object({
      name: vine.string().trim().optional(),
      description: vine.string().optional(),
      permissionIds: vine.array(vine.number()).optional(),
    })

    const payload = await request.validateUsing(vine.compile(schema))
    const trx = await db.transaction()

    try {
      if (payload.name) {
        const existing = await Role.query()
          .where('name', payload.name)
          .whereNot('id', role.id)
          .first()
        if (existing) {
          await trx.rollback()
          return response.badRequest({ error: 'Role name already in use' })
        }
        role.name = payload.name
      }

      if (payload.description !== undefined) {
        role.description = payload.description || null
      }

      role.useTransaction(trx)
      await role.save()

      if (payload.permissionIds) {
        await role.related('permissions').sync(payload.permissionIds)
      }

      await trx.commit()

      ActivityLogService.log(
        user.id,
        'UPDATE_ROLE',
        'ROLE_MANAGEMENT',
        `Updated role ${role.name}`,
        request.ip()
      )

      await role.load('permissions')

      return response.ok({ data: role })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({ error: 'Failed to update role' })
    }
  }

  public async destroy({ params, response, auth, request }: HttpContext) {
    const user = auth.user!

    const role = await Role.find(params.id)
    if (!role) {
      return response.notFound({ error: 'Role not found' })
    }

    await role.delete()

    ActivityLogService.log(
      user.id,
      'DELETE_ROLE',
      'ROLE_MANAGEMENT',
      `Deleted role ${role.name}`,
      request.ip()
    )

    return response.noContent()
  }
}
