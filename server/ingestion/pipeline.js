
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

/**
 * Canonical ingestion pipeline
 */
export async function processDocumentIngestion({
    type = 'pdf',        // "pdf" | "html" | "docx" | "txt"
    source,      // file path OR raw html
    metadata,    // { userId, docId, source, filename, ... }
}) {

// TEXT EXTRACTION (format-specific)
    let docs = await extractDocument({
        type,
        source,
    });

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
    validateChunks(chunks);


// EMBEDDINGS
    const embeddings = createEmbeddings();


// VECTOR INDEXING (Pinecone)
    await indexDocuments(chunks, embeddings);


// FINAL RESULT (for logging/metrics)
    return {
        status: "success",
        totalDocuments: docs.length,
        totalChunks: chunks.length,
        docId: metadata.docId,
    };
}
