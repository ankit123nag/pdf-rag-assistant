# PDF RAG Assistant
A full-stack application that allows authenticated users to upload PDF documents and query their content using a Retrieval-Augmented Generation (RAG) pipeline.

This project focuses on clean system design, asynchronous processing, and secure integration between frontend, backend, and AI workflows.

## Features
- User authentication using Clerk
- Secure PDF upload
- Asynchronous document ingestion using queues
- Text extraction and chunking
- Foundation for RAG-based querying
- Modular, production-style architecture

## Tech Stack
### Frontend
- Next.js
- TypeScript
- Clerk Authentication

### Backend
- Node.js
- Express
- Multer
- Background worker

### Infrastructure
- Valkey (Redis-compatible queue)
- Docker

### AI / RAG
- LangChain
- PDF parsing and text splitting

## Architecture Overview
```scss
Next.js (UI)
   ↓
Express API (Auth, Upload, Queue)
   ↓
Valkey Queue
   ↓
Worker (PDF parsing, chunking, embeddings)
```
Authentication is handled at the API boundary, while document ingestion and processing are performed asynchronously by background workers.

## Local Setup
### Prerequisites
- Node.js (v18+)
- Docker

### Environment Variables
Create environment files using the provided .env.example templates in the respective client and server directories.

## Running the Application
From the project root, run:
```bash
npm run dev
```

This will:
- Start required Docker services
- Start the backend API
- Start the background worker
- Start the frontend application

## Project Status
- Authentication & uploads: ✅
- PDF ingestion pipeline: ✅
- RAG query endpoint: 🚧 In progress
- UI for querying documents: 🚧 In progress

## Notes
- Background processing is decoupled from the API using a queue-based architecture
- Authentication is handled using Clerk modals on the frontend
- The project is designed to demonstrate real-world, scalable application patterns
