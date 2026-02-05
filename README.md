# PDF RAG Assistant (Ingestion Foundation)
A full-stack application that allows authenticated users to upload PDF documents and query their content using a Retrieval-Augmented Generation (RAG) pipeline.

This project focuses on clean system design, asynchronous processing, and secure integration between frontend, backend, and AI workflows.

The document ingestion pipeline is fully implemented and operational; query and UI layers are under active development.

## 🚀 Key Features
- User authentication via Clerk
- Secure document upload
- Asynchronous ingestion using a queue + background worker with batch-level logging and retry-safe vector indexing
- Multi-format document support (PDF, HTML, DOCX, TXT)
- Robust document cleaning & normalization
- Exact and near-duplicate content detection
- Idempotent ingestion (duplicate uploads are automatically skipped)
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
 → Chunking (deterministic)
 → Metadata Enrichment
 → Quality Validation (guardrails + skip semantics)
 → Embeddings (LangChain-managed batching)
 → Batched Vector Indexing (retry-safe, observable)
```
This ensures high-quality, deduplicated, and retrieval-ready data while preventing runaway cost.

## 🛡 Ingestion Guardrails & Cost Control
- The ingestion system enforces explicit safeguards to ensure predictable behavior:
- Hard chunk limits to prevent runaway documents
- Low-information chunk filtering
- Skip semantics for invalid documents (non-retryable)
- Idempotent ingestion using content fingerprints (Redis-backed)
- Batched Pinecone indexing with isolated retries
- Namespace isolation to prevent cross-user data leakage
Invalid documents are intentionally skipped, not failed.

## 🏗 Architecture Overview
```text
Next.js (Frontend UI)
        ↓
Express API (Auth, Upload, Queue)
        ↓
Valkey / Redis (persistent)
  ├─ BullMQ (job queue)
  ├─ Fingerprint store (idempotent ingestion)
  └─ Shared Redis client (single connection)
        ↓
Background Worker
        ├─ Extraction (PDF / HTML / DOCX / TXT)
        ├─ Cleaning & Normalization
        ├─ Deduplication
        ├─ Chunking
        ├─ Validation
        ├─ Embeddings
        └─ Pinecone Indexing
```
- Authentication is enforced at the API boundary
- All heavy processing is offloaded to background workers
- Workers are concurrency-limited and retry-safe

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
│   ├── index.js                 # API server
│   ├── worker.js                # Background worker
│   ├── ingestion/
│   │   ├── extract/             # PDF, HTML, DOCX, TXT extractors
│   │   ├── clean/               # Boilerplate + normalization
│   │   ├── dedupe/              # Exact & near-duplicate detection
│   │   ├── chunk/               # Deterministic chunking
│   │   ├── enrich/              # Metadata attachment
│   │   ├── validate/            # Quality checks & guardrails
│   │   ├── embed/               # Embeddings
│   │   ├── index/               # Pinecone indexing
│   │   └── pipeline.js          # Canonical ingestion pipeline
│   ├── utils/                   # Shared utilities
│   │   ├── batch.util.js        # Network-bound batching
│   │   ├── retry.util.js        # Isolated retry logic
│   │   ├── fingerprint.util.js  # Content fingerprinting
│   │   └── fingerprint.store.js # Redis-backed idempotency
│   └── config/
├── client/web                   # Next.js app
├── scripts
├── docker-compose.yml

```

## Local Setup
### Prerequisites
- Node.js (v18+)
- Docker

### Environment Variables
Create environment files using the provided .env.example templates in the respective client and server directories.
A single Redis connection is shared by BullMQ and all ingestion utilities (batch retries, fingerprint storage, idempotency).

## Redis / Valkey Persistence
Redis / Valkey is used not only for job queueing (BullMQ) but also for
persistent ingestion state such as document fingerprints.

To ensure idempotent ingestion across restarts, Redis persistence **must be enabled**. The system relies on Redis retaining keys between container or process restarts.

Persistence is typically enabled via:
- RDB snapshots (recommended)
- or AOF (append-only file)

When running via Docker, a volume must be mounted to persist data.

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
- Concurrency is intentionally limited
- Files are read using absolute, normalized paths
- PDF extraction uses buffer-based loading for cross-platform safety
- Batch-level retries occur only where failures happen
- Invalid documents are skipped, not retried

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
- Idempotency relies on persistent state; infrastructure durability is treated as a correctness requirement, not an optimization
- Prefer no ingestion over incorrect ingestion
- Built as a scalable foundation for future RAG capabilities
- A single shared Redis client is used to enforce consistency and prevent connection sprawl

## Batching & Retry Strategy
- Batching is applied only at network boundaries
- Embeddings are batched internally by LangChain
- Pinecone indexing is explicitly batched at the application level
- Each batch is logged with start / success / failure states
- Retries occur only at the failing batch, not the entire document
- Failures propagate cleanly for queue-level retries

## 🔮 Planned Enhancements
- User query & prompt processing
- Retrieval pipeline
- LLM-based answer generation
- Citation & source attribution
- Evaluation & feedback loop

## 📎 Summary
This project provides a production-ready ingestion foundation for a RAG system.

The pipeline is idempotent, cost-aware, retry-safe, and designed to be safely run multiple times without duplicating data or incurring unbounded embedding costs.