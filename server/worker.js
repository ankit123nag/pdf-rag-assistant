import "dotenv/config";
import { Worker } from "bullmq";
import { detectDocumentType } from "./utils/detectDocumentType.js";
import { processDocumentIngestion } from "./ingestion/pipeline.js";

const worker = new Worker(
    "file-upload-queue",
    async (job) => {
        if (!job) return;

        console.log("Worker received job:", job.id, job.data);
        try {
            const data = job?.data;
            const documentType = detectDocumentType({
                type: data?.type,
                mimetype: data?.mimetype,
                filename: data?.fileName,
            });

            // Execute ingestion pipeline
            
            const response = await processDocumentIngestion({
                type: documentType,
                source: data?.path,
                metadata: {
                    userId: data?.userId ?? '',
                    docId: data?.docId ?? '',
                    source: data?.fileName ?? '',
                },
            });
            const { totalDocuments, totalChunks, docId } = response;
            console.log(`Job ${job.id} completed successfully
                \nTotal Documents: ${totalDocuments}
                \nTotal Chuncks: ${totalChunks}
                \nDocument Id: ${docId}`);
        } catch (err) {
            console.error(`Job ${job.id} failed`, err);
            // IMPORTANT: rethrow so BullMQ can retry / mark failed
            throw err;
        }
    },
    {
        concurrency: 5,
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);

console.log("Worker started and listening to file-upload-queue");
