# ESC Project Tracker Frontend

## Overview
ESC Project Tracker (`tracker.intania.org`) is a project and document management system for coordination between the ESC secretariat and project owners under the Engineering Student Committee.

This repository contains the frontend application for browsing projects, managing documents, tracking filing activity, and using the ESC workflow through a web interface.

## How to Run
1. Create a local environment file.

```powershell
Copy-Item .env.example .env.local
```

2. Set the backend API base URL in `.env.local`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. Install dependencies and start the development server.

```powershell
bun install
bun run dev
```

4. Open the app in your browser.

```text
http://localhost:3000
```

Note:
- The backend must be running before using the frontend locally.
- In production, `NEXT_PUBLIC_API_BASE_URL` must point to the deployed backend origin.
