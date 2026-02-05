import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { batchArray } from "../../utils/batch.util.js";
import { withRetry } from "../../utils/retry.util.js";

/**
 * Determines batch size based on document size.
 *
 * Smaller docs → smaller batches (less overhead)
 * Larger docs → larger batches (fewer network calls)
 */
function resolveBatchSize(count) {
    if (count < 200) return 50;
    if (count < 500) return 75;
    return 100;
}

/**
 * Indexes documents into Pinecone with:
 * - Explicit batching
 * - Per-batch logging
 * - Isolated retries
 * - Namespace isolation (per user)
 *
 * Embeddings are handled internally by LangChain.
 */
export async function indexDocuments(docs, embeddings) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    const index = pinecone.index(process.env.PINECONE_INDEX);

    const store = await PineconeStore.fromExistingIndex(
        embeddings,
        {
            pineconeIndex: index,
            namespace: docs[0]?.metadata?.userId
        }
    );

    const batchSize = resolveBatchSize(docs.length);
    const batches = batchArray(docs, batchSize);

    let indexed = 0;

    console.log(`[pinecone-index] totalChunks=${docs.length}, batches=${batches.length}`);

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const label = `pinecone batch ${i + 1}/${batches.length}`;

        console.log(`[pinecone-index] starting ${label} size=${batch.length}`);

        await withRetry(
            () => store.addDocuments(batch),
            { label }
        );

        indexed += batch.length;
        console.log(`[pinecone-index] completed ${label}`);
    }

    console.log(`[pinecone-index] indexedVectors=${indexed}`);
}
