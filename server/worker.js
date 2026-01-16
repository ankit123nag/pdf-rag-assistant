import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from '@langchain/core/documents';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker('file-upload-queue', async job => {
    if (job) {
        const data = JSON.parse(job.data);

        // Load the pdf and chunking it using text splitter
        const loader = new PDFLoader(data.path);
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 250,
            chunkOverlap: 10,
        });

        try {
            const docs = await loader.load();
            const texts = await splitter.splitDocuments(docs);
            console.log(`Split blog post into ${texts.length} sub-documents.`, texts);
        } catch (err) {
            console.log(err);
        }
    }
}, {
    concurrency: 100,
    connection: {
        host: 'localhost',
        port: '6379'
    }
});