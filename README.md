# African Libraries waitlist

Implementation of the [Figma Waitlist page](https://www.figma.com/design/Hcavcg77RJzS0Hyc0BFtOm/Book?node-id=151-4027).

## Run

Requires Node.js 22.13 or later. No dependencies or build step.

```sh
npm run dev
```

Open http://localhost:3000. Use `npm start` without file watching. `PORT` defaults to `3000`; `DATA_DIR` defaults to `./data`. Mount `DATA_DIR` on persistent storage when deploying.

## Flows

- Landing page with the original logo, local fonts, diagonal looping book carousel, founding author benefits, and FAQs.
- Role selection → author or reader form → saved confirmation → back to landing.
- First name, phone, and email are required; last name and referral are optional, matching Figma. Form drafts survive navigating back during the session.
- Client and server validation, submission progress, accessible inline errors, and connection failure handling.
- SQLite persists registrations, role, referral, and email-update consent timestamp. Repeated email/role submissions are idempotent; one email can register for both roles. Existing entries are never overwritten by repeat submissions.

`POST /api/waitlist` accepts `firstName`, `lastName`, `phone`, `email`, `referral`, and `role` (`author` or `reader`). The database is private and is never served as a static asset.

```sh
npm test
```

The integration test uses an isolated temporary database and checks validation, both roles, duplicate prevention, persistence after restart, and private database access.

Email delivery is not configured. Registrations are stored for future launch announcements; submitting the form does not send an email.

## Private preview deployment

`npm run build` bundles the same UI, exact design assets, and validation into a single Cloudflare Worker for Sites. The hosted API uses the `DB` D1 binding declared in `.openai/hosting.json`; Sites applies the schema migration in `drizzle/`. Local development continues to use SQLite, with the same table and validation rules. Private preview access is enforced by Sites.
