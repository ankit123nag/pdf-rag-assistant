import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

export async function indexDocuments(docs, embeddings) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    const index = pinecone.index(process.env.PINECONE_INDEX);

    const store = await PineconeStore.fromExistingIndex(
        embeddings,
        { pineconeIndex: index }
    );

    await store.addDocuments(docs);
}
