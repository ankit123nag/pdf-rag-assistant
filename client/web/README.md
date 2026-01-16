# Frontend (Next.js)
This is the frontend application for the PDF RAG Assistant.
It provides the user interface for authentication, PDF uploads, and querying document content.

---

## Tech Stack
- Next.js (App Router)
- TypeScript
- Clerk Authentication

## Features
- User authentication via Clerk
- PDF upload interface
- Authenticated API communication
- Basic UI for querying document content

## Running Locally
```bash
npm install
npm run dev
```
The application expects the backend API to be running and accessible via environment variables.

## Environment Variables
Create a .env.local file using the values from .env.example.

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## Notes
- Authentication is handled using Clerk modals
- The frontend communicates with the backend over authenticated requests