import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Employee from '#models/employee'
import vine from '@vinejs/vine'
import ActivityLogService from '#services/activity_log_service'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class EmployeesController {
  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const employees = await Employee.query()
      .preload('user')
      .preload('department')
      .preload('roles')
      .paginate(page, limit)

    return response.ok({ data: employees })
  }

  public async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const schema = vine.object({
      name: vine.string().trim(),
      email: vine.string().email(),
      password: vine.string().minLength(6),
      phone: vine.string().optional(),
      jobTitle: vine.string(),
      departmentId: vine.number().optional(),
      joiningDate: vine.date(),
      status: vine.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
      workingHours: vine.string().optional(),
      salary: vine.number().optional(),
      address: vine.string().optional(),
      roleIds: vine.array(vine.number()).optional(),
    })

    const payload = await request.validateUsing(vine.compile(schema))

    // Check if email already exists
    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.badRequest({ error: 'Email is already in use.' })
    }

    const trx = await db.transaction()

    try {
      // 1. Create User
      const newUser = new User()
      newUser.name = payload.name
      newUser.email = payload.email
      newUser.password = payload.password
      newUser.phone = payload.phone || null
      newUser.role = 'EMPLOYEE'
      newUser.useTransaction(trx)
      await newUser.save()

      // 2. Generate unique Employee ID (e.g. EMP-1001)
      const empCount = await Employee.query({ client: trx }).count('* as total').first()
      const nextId = Number.parseInt((empCount?.$extras.total || 0).toString()) + 1001
      const employeeIdCode = `EMP-${nextId}`

      // 3. Create Employee Profile
      const employee = new Employee()
      employee.userId = newUser.id
      employee.employeeIdCode = employeeIdCode
      employee.jobTitle = payload.jobTitle
      employee.departmentId = payload.departmentId || null
      employee.joiningDate = DateTime.fromJSDate(payload.joiningDate)
      employee.status = payload.status || 'ACTIVE'
      employee.workingHours = payload.workingHours || null
      employee.salary = payload.salary || null
      employee.address = payload.address || null
      employee.useTransaction(trx)
      await employee.save()

      // 4. Assign roles
      if (payload.roleIds && payload.roleIds.length > 0) {
        await employee.related('roles').attach(payload.roleIds)
      }

      await trx.commit()

      // Log Activity
      ActivityLogService.log(
        user.id,
        'CREATE_EMPLOYEE',
        'EMPLOYEE_MANAGEMENT',
        `Created employee ${newUser.email} with ID ${employeeIdCode}`,
        request.ip()
      )

      await employee.load('user')
      await employee.load('roles')

      return response.created({ data: employee })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({
        error: 'Failed to create employee',
        details: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    const employee = await Employee.query()
      .where('id', params.id)
      .preload('user')
      .preload('department')
      .preload('roles', (rolesQuery) => {
        rolesQuery.preload('permissions')
      })
      .first()

    if (!employee) {
      return response.notFound({ error: 'Employee not found' })
    }

    return response.ok({ data: employee })
  }

  public async update({ params, request, response, auth }: HttpContext) {
    const user = auth.user!

    const employee = await Employee.query().where('id', params.id).preload('user').first()
    if (!employee) {
      return response.notFound({ error: 'Employee not found' })
    }

    const schema = vine.object({
      name: vine.string().trim().optional(),
      phone: vine.string().optional(),
      jobTitle: vine.string().optional(),
      departmentId: vine.number().optional(),
      status: vine.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
      workingHours: vine.string().optional(),
      salary: vine.number().optional(),
      address: vine.string().optional(),
      roleIds: vine.array(vine.number()).optional(),
    })

    const payload = await request.validateUsing(vine.compile(schema))
    const trx = await db.transaction()

    try {
      // Update User portion
      const empUser = employee.user
      if (payload.name) empUser.name = payload.name
      if (payload.phone !== undefined) empUser.phone = payload.phone || null
      empUser.useTransaction(trx)
      await empUser.save()

      // Update Employee portion
      if (payload.jobTitle) employee.jobTitle = payload.jobTitle
      if (payload.departmentId !== undefined) employee.departmentId = payload.departmentId || null
      if (payload.status) employee.status = payload.status
      if (payload.workingHours !== undefined) employee.workingHours = payload.workingHours || null
      if (payload.salary !== undefined) employee.salary = payload.salary || null
      if (payload.address !== undefined) employee.address = payload.address || null
      employee.useTransaction(trx)
      await employee.save()

      // Update Roles
      if (payload.roleIds) {
        await employee.related('roles').sync(payload.roleIds)
      }

      await trx.commit()

      // Log Activity
      ActivityLogService.log(
        user.id,
        'UPDATE_EMPLOYEE',
        'EMPLOYEE_MANAGEMENT',
        `Updated employee ${empUser.email}`,
        request.ip()
      )

      await employee.load('roles')

      return response.ok({ data: employee })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({
        error: 'Failed to update employee',
        details: error.message,
      })
    }
  }
}
