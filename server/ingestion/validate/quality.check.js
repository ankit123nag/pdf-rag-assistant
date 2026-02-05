/**
 * Quality validation for document chunks.
 *
 * This module enforces safety and cost guardrails before expensive
 * downstream operations (embeddings + vector indexing).
 *
 * IMPORTANT:
 * - This function does NOT throw for bad documents.
 * - Invalid or overly large documents are SKIPPED intentionally.
 * - Skipped documents are treated as terminal (non-retryable).
 */

const MIN_LENGTH = 20;           // Minimum characters required per chunk
const MAX_CHUNKS = 1000;         // Hard upper bound to control cost & safety
const MIN_UNIQUE_RATIO = 0.3;    // Heuristic to drop low-information chunks

/**
 * Computes the ratio of unique tokens to total tokens.
 * Used to detect boilerplate-heavy or repetitive text.
 */
function uniqueRatio(text) {
    const tokens = text.split(/\s+/);
    if (tokens.length === 0) return 0;

    const unique = new Set(tokens);
    return unique.size / tokens.length;
}

/**
 * Validates chunks produced by the chunking stage.
 *
 * Behavior:
 * - If chunk count exceeds MAX_CHUNKS → document is skipped
 * - Drops low-quality chunks silently
 * - If no valid chunks remain → document is skipped
 *
 * Returns a structured result so the pipeline can
 * decide whether to continue or stop gracefully.
 */
export function validateChunks(chunks) {
    // Hard guardrail: prevent runaway documents
    if (chunks.length > MAX_CHUNKS) {
        return {
            status: "skipped",
            reason: `chunk limit exceeded (${chunks.length})`
        };
    }

    const valid = chunks.filter(chunk =>
        chunk.pageContent?.length >= MIN_LENGTH &&
        uniqueRatio(chunk.pageContent) >= MIN_UNIQUE_RATIO
    );

    if (!valid.length) {
        return {
            status: "skipped",
            reason: "no valid chunks after validation"
        };
    }

    return {
        status: "ok",
        chunks: valid
    };
}
