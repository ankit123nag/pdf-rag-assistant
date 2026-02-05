import { redis } from "../config/redis.js";

/**
 * Persistent fingerprint store backed by Redis / Valkey.
 *
 * Prevents re-ingesting identical documents across jobs
 * and across worker restarts.
 */

const PREFIX = "doc:fingerprint";

/**
 * Returns true if the fingerprint already exists.
 */
export async function hasFingerprint(fingerprint) {
    return await redis.exists(`${PREFIX}:${fingerprint}`);
}

/**
 * Stores fingerprint after successful ingestion.
 *
 * IMPORTANT:
 * Must be called ONLY after Pinecone indexing succeeds.
 */
export async function saveFingerprint(fingerprint, metadata) {
    await redis.set(
        `${PREFIX}:${fingerprint}`,
        JSON.stringify({
            docId: metadata.docId,
            userId: metadata.userId,
            storedAt: Date.now()
        })
    );
}
