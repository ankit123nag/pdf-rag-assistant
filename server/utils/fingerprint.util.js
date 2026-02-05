import crypto from "crypto";

/**
 * Generates a deterministic fingerprint for a document's content.
 *
 * Purpose:
 * - Detect duplicate document uploads
 * - Avoid re-embedding identical content
 * - Enable idempotent ingestion
 *
 * NOTE:
 * This should be run only after normalization + deduplication
 * so that semantically identical documents produce the same hash.
 */
export function fingerprintText(text) {
    return crypto
        .createHash("sha256")
        .update(text, "utf8")
        .digest("hex");
}