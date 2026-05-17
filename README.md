# ESC Project Tracker Refresh Frontend

Next.js frontend for the ESC Project Tracker revamp.

## Direction

- Separate frontend repo for the polyrepo revamp.
- Consume the Go backend through REST/OpenAPI.
- Use Google Auth entry points exposed by the backend.
- Keep app-owned HTTP-only cookies for `accessToken` and `refreshToken`.
- Use new terminology: `Project -> Document -> Filing`.

## First Milestone

Authenticated Project Skeleton:

1. User clicks Google login.
2. Backend handles Google auth and app session cookies.
3. Frontend calls `/auth/me`.
4. User can create and list projects.

## Local Development

```powershell
Copy-Item .env.example .env.local
bun install
bun run dev
```
