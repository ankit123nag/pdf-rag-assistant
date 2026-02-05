/**
 * Generic retry helper with linear backoff and logging.
 *
 * Purpose:
 * - Retry ONLY the failing operation
 * - Avoid retrying entire documents
 * - Improve resilience against transient network errors
 *
 * Usage:
 * withRetry(() => networkCall(), { label: "pinecone batch 2/5" })
 */
export async function withRetry(
    fn,
    {
        retries = 3,
        label = "operation",
        delayMs = 500
    } = {}
) {
    let attempt = 0;

    while (attempt < retries) {
        try {
            if (attempt > 0) {
                console.warn(`[retry] ${label} attempt ${attempt + 1}`);
            }
            return await fn();
        } catch (err) {
            attempt++;
            console.error(`[error] ${label} failed on attempt ${attempt}`, err);

            if (attempt >= retries) {
                throw err;
            }

            await new Promise(r => setTimeout(r, delayMs * attempt));
        }
    }
}
