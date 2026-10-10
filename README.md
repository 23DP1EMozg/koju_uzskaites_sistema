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
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
