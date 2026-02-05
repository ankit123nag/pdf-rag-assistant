import { extractDocument } from "./extract/index.js";               //  Extraction
import { removeBoilerplate } from "./clean/boilerplate.clean.js";   //  Cleaning
import { normalizeText } from "./clean/normalize.clean.js";         //  Cleaning
import { exactDedupe } from "./dedupe/exact.dedupe.js";             //  Deduplication
import { nearDedupe } from "./dedupe/near.dedupe.js";               //  Deduplication
import { chunkDocuments } from "./chunk/chunk.text.js";             //  Chunking
import { attachMetadata } from "./enrich/metadata.enrich.js";       //  Enrichment
import { validateChunks } from "./validate/quality.check.js";       //  Validation
import { createEmbeddings } from "./embed/embeddings.js";           //  Embedding
import { indexDocuments } from "./index/pinecone.index.js";         //  Indexing
import { fingerprintText } from "../utils/fingerprint.util.js";
import {
    hasFingerprint,
    saveFingerprint
} from "../utils/fingerprint.store.js";

/**
 * Canonical document ingestion pipeline.
 *
 * This pipeline is:
 * - deterministic
 * - retry-safe
 * - cost-controlled
 * - idempotent across jobs
 */
export async function processDocumentIngestion({
    type = 'pdf',        // "pdf" | "html" | "docx" | "txt"
    source,              // file path OR raw html
    metadata,            // { userId, docId, source, filename, ... }
}) {

    // TEXT EXTRACTION (format-specific)
    let docs = await extractDocument({ type, source });

    if (!docs || docs.length === 0) {
        throw new Error("No documents extracted");
    }

    // STRUCTURAL CLEANUP + NORMALIZATION
    docs = docs.map(doc => ({
        ...doc,
        pageContent: normalizeText(
            removeBoilerplate(doc.pageContent)
        ),
    }));

    // DEDUPLICATION (exact + near)
    docs = exactDedupe(docs);
    docs = nearDedupe(docs);

    if (docs.length === 0) {
        throw new Error("All documents removed during deduplication");
    }

    // CHUNKING
    let chunks = await chunkDocuments(docs);

    if (!chunks || chunks.length === 0) {
        throw new Error("Chunking produced no output");
    }

    // METADATA ENRICHMENT
    chunks = attachMetadata(chunks, metadata);

    // QUALITY VALIDATION
    const validation = validateChunks(chunks);

    if (validation.status === "skipped") {
        return {
            status: "skipped",
            reason: validation.reason,
            docId: metadata.docId,
        };
    }

    chunks = validation.chunks;

    // FINGERPRINT (content-based, post-normalization)
    const fingerprint = fingerprintText(
        chunks.map(c => c.pageContent).join("")
    );

    // IDEMPOTENCY CHECK (cross-job)
    const alreadyIngested = await hasFingerprint(fingerprint);

    if (alreadyIngested) {
        console.warn(
            `[pipeline] duplicate document detected — skipping ingestion`,
            {
                docId: metadata.docId,
                userId: metadata.userId,
                fingerprint
            }
        );

        return {
            status: "skipped",
            reason: "duplicate document",
            fingerprint,
            docId: metadata.docId,
        };
    }

    // EMBEDDINGS
    const embeddings = createEmbeddings();

    // VECTOR INDEXING (Pinecone)
    await indexDocuments(chunks, embeddings);

    // PERSIST FINGERPRINT (only after success)
    await saveFingerprint(fingerprint, metadata);

    // FINAL RESULT
    return {
        status: "success",
        totalDocuments: docs.length,
        totalChunks: chunks.length,
        fingerprint,
        docId: metadata.docId,
    };
}
