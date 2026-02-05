import { fingerprintText } from "../../utils/fingerprint.util.js";

/**
 * Removes exact duplicate documents based on content hash.
 *
 * Assumes:
 * - Text has already been normalized upstream
 * - Deduplication happens before chunking
 *
 * Uses shared fingerprint utility to ensure consistency
 * across ingestion stages.
 */
export function exactDedupe(docs) {
    const seen = new Set();

    return docs.filter(doc => {
        const hash = fingerprintText(doc.pageContent);

        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
    });
}
