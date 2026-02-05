/**
 * Splits an array into fixed-size batches.
 *
 * Used only at network boundaries:
 * - Vector DB upserts
 * - External API calls
 *
 * SHOULD NOT be used for CPU-bound steps
 * like extraction, cleaning, or chunking.
 */
export function batchArray(items, size) {
    if (!Array.isArray(items)) {
        throw new Error("batchArray expects an array");
    }
    if (size <= 0) {
        throw new Error("batch size must be > 0");
    }

    const batches = [];
    for (let i = 0; i < items.length; i += size) {
        batches.push(items.slice(i, i + size));
    }
    return batches;
}
