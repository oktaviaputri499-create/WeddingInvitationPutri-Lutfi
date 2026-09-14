# Wedding Invitation App

A modern, mobile-first, and elegant wedding invitation platform built with Next.js 14, Tailwind CSS, and Prisma.

## Features
- **Unique Guest Links**: `/?guest=TOKEN` or `/invitation/TOKEN`
- **Read-only Names**: Guests cannot change their names.
- **RSVP System**: Track attendance and number of guests.
- **Guestbook/Wishes**: Guests can leave messages.
- **Admin Dashboard**: Manage guests, view RSVP stats, and export data.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   By default, this uses SQLite for easy setup. To use PostgreSQL, change the `provider` in `prisma/schema.prisma` to `"postgresql"` and update `.env`.
   ```bash
   cp .env.example .env
   npx prisma db push
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Admin Dashboard: `http://localhost:3000/admin` (Password is in `.env`)
   - Guest Invitation: Generate a link from the admin dashboard and open it.
