import "dotenv/config";
import { Worker } from 'bullmq';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const worker = new Worker('file-upload-queue', async job => {

    if (job) {
        const data = JSON.parse(job.data);
        // PDF Loader initialize
        const loader = new PDFLoader(data.path);

        // Initializing text-splitter
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 250,
            chunkOverlap: 10,
        });

        // Initializing Vector DB (Pinecone)
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX);

        // Initializing OpenAI Embeddings
        // const embeddings = new OpenAIEmbeddings({
        //     model: "text-embedding-3-small",
        //     apiKey: process.env.OPENAI_API_KEY
        // });

        // Initializing Hugging Face Embeddings
        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINGFACEHUB_API_KEY,
            model: "sentence-transformers/all-mpnet-base-v2", // Defaults to `BAAI/bge-base-en-v1.5` if not provided
            provider: "hf-inference", // Falls back to auto selection mechanism within Hugging Face's inference API if not provided
        });

        try {
            const docs = await loader.load();
            const texts = await splitter.splitDocuments(docs);
            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex,
                // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
                maxConcurrency: 5,
                // You can pass a namespace here too
                // namespace: "foo",
            });
            await vectorStore.addDocuments(texts);
            console.log(`Split blog post into ${texts.length} sub-documents.`, texts);
        } catch (err) {
            console.log(err);
        }
    }
}, {
    concurrency: 5,
    connection: {
        host: 'localhost',
        port: 6379
    }
});

console.log("Worker started")