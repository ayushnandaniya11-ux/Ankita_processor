import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@ankita.com',
        password: 'password123',
        phone: '9876543210',
        role: 'ADMIN' as const,
      },
      {
        name: 'John Customer',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'CUSTOMER' as const,
      },
      {
        name: 'Sarah Wholesale',
        email: 'sarah@wholesale.com',
        password: 'password123',
        phone: '9876543212',
        role: 'WHOLESALE' as const,
      },
    ]

    for (const u of users) {
      await User.updateOrCreate({ email: u.email }, u)
    }
  }
}
