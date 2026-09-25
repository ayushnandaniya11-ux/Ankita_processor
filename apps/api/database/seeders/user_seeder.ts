import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        name: 'Admin User',
        email: 'admin@ankita.com',
        password: 'password123',
        phone: '9876543210',
        role: 'ADMIN',
      },
      {
        name: 'John Customer',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'CUSTOMER',
      },
      {
        name: 'Sarah Wholesale',
        email: 'sarah@wholesale.com',
        password: 'password123',
        phone: '9876543212',
        role: 'WHOLESALE',
      },
    ])
  }
}
