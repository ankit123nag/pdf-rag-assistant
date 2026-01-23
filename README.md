# PDF RAG Assistant (Ingestion Foundation)
A full-stack application that allows authenticated users to upload PDF documents and query their content using a Retrieval-Augmented Generation (RAG) pipeline.

This project focuses on clean system design, asynchronous processing, and secure integration between frontend, backend, and AI workflows.

The document ingestion pipeline is fully implemented and operational; query and UI layers are under active development.

## 🚀 Key Features
- User authentication via Clerk
- Secure document upload
- Asynchronous ingestion using a queue + background worker
- Multi-format document support (PDF, HTML, DOCX, TXT)
- Robust document cleaning & normalization
- Exact and near-duplicate content detection
- Deterministic chunking
- Vector embeddings generation
- Vector storage in Pinecone
- Modular, production-grade architecture

⚠️ This project currently focuses on document ingestion only.
Querying and LLM-based responses are planned but not yet implemented.

## Ingestion Pipeline
The ingestion pipeline explicitly implements the following stages:
```text
Raw Document
 → Text Extraction (format-aware)
 → Boilerplate Removal
 → Text Normalization
 → Exact & Near-Deduplication
 → Chunking
 → Metadata Enrichment
 → Quality Validation
 → Embeddings
 → Vector Indexing
```
This ensures high-quality, deduplicated, and retrieval-ready data.

## 🏗 Architecture Overview
```text
Next.js (Frontend UI)
        ↓
Express API (Auth, Upload, Queue)
        ↓
Valkey / Redis Queue
        ↓
Background Worker
        ├─ Extraction (PDF / HTML / DOCX / TXT)
        ├─ Cleaning & Normalization
        ├─ Deduplication
        ├─ Chunking
        ├─ Embeddings
        └─ Pinecone Indexing
```
- Authentication is enforced at the API boundary
- All heavy processing is offloaded to background workers
- Workers are retry-safe and fail fast on invalid data

## Tech Stack
### Frontend
- Next.js
- TypeScript
- Clerk Authentication

### Backend
- Node.js
- Express
- Multer
- BullMQ (queue + worker)
- Valkey / Redis

### AI / Vector Infrastructure
- LangChain (modular usage)
- Hugging Face Inference embeddings
- Pinecone (vector database)

### Infrastructure
- Docker
- Docker Compose

## 📁 Project Structure
```bash
pdf_rag_assistant
├── server
│   ├── index.js                # API server
│   ├── worker.js               # Background worker
│   ├── ingestion/
│   │   ├── extract/            # PDF, HTML, DOCX, TXT extractors
│   │   ├── clean/              # Boilerplate + normalization
│   │   ├── dedupe/             # Exact & near-duplicate detection
│   │   ├── chunk/              # Deterministic chunking
│   │   ├── enrich/             # Metadata attachment
│   │   ├── validate/           # Quality checks
│   │   ├── embed/              # Embeddings
│   │   ├── index/              # Pinecone indexing
│   │   └── pipeline.js         # Canonical ingestion pipeline
│   ├── utils/
│   │   └── detectDocumentType.js
│   └── config/
├── client/web                  # Next.js app
├── scripts
├── docker-compose.yml

```

## Local Setup
### Prerequisites
- Node.js (v18+)
- Docker

### Environment Variables
Create environment files using the provided .env.example templates in the respective client and server directories.

## Running the Application
From the project root, run:
```bash
npm install
npm run dev
```

This will:
- Start required Docker services
- Start the backend API
- Start the background worker
- Start the frontend application

## 🔄 Background Worker Design
- Workers consume jobs from the file-upload-queue
- Concurrency is managed by BullMQ
- Files are read using absolute, normalized paths
- PDF extraction uses buffer-based loading for cross-platform safety
- Failures propagate correctly for retries

## 📌 Current Project Status
| Feature                       | Status             |
| ----------------------------- | -------------------|
| Authentication & uploads      | ✅                 |
| Asynchronous ingestion        | ✅                 |
| Multi-format extraction       | ✅                 |
| Cleaning & deduplication      | ✅                 |
| Embeddings & Pinecone storage | ✅                 |
| User prompt handling          | ❌ Not implemented |
| RAG querying                  | ❌ Not implemented |
| LLM responses                 | ❌ Not implemented |


## 🧭 Design Philosophy
- Clear separation of concerns (API, worker, pipeline)
- Deterministic and retry-safe ingestion
- Infrastructure decoupled from business logic
- Built as a scalable foundation for future RAG capabilities

## 🔮 Planned Enhancements
- User query & prompt processing
- Retrieval pipeline
- LLM-based answer generation
- Citation & source attribution
- Evaluation & feedback loop

## 📎 Summary
This project serves as a robust foundation for a RAG system, focusing first on ingestion quality and system correctness before adding query and generation layers.