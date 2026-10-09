# Koju uzskaites sistēma

A web app for managing the RVT dormitory: students apply to live there, an admin approves them, and approved students become tenants.

## How it works

1. **Apply** (`/apply`): a student fills in personas kods, name, phone and e-mail. The application is saved in the `users` table without a course.
2. **Review** (`/adminDashboard`): the admin sees pending applications (users without a course) and can reject them or approve them.
3. **Approve**: the admin sets the course (e.g. `DP2-1`) and room number. The user becomes a tenant, gets a temporary password and receives it by e-mail.
4. **Manage tenants**: the admin can search tenants, view their details or delete them.

## Admin dashboard sections

| Section | Status |
|---|---|
| Pieteikumi (applications) | Done |
| Iemītnieki (tenants) | Done |
| Sūdzības (complaints) | Placeholder, waiting for the tenant complaint page |
| Informācija, Pasākumi | Not started |

## Design

- Admin pages use the red design.
- Tenant pages will take their colours from their floor (first digit of the room number): floors 2 and 5 yellow, 1 and 4 light orange, 3 green.

## Tech

- Next.js 16 (App Router) with Tailwind CSS 4
- Supabase as the database (`users` table)
- Nodemailer over SMTP for e-mails

## Running it

Create a `.env` file in the project root with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `BCRYPT` and the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` settings, then run:

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.
