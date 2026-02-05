import "dotenv/config";
import { Worker } from "bullmq";
import { detectDocumentType } from "./utils/detectDocumentType.util.js";
import { processDocumentIngestion } from "./ingestion/pipeline.js";

/**
 * Worker concurrency is intentionally limited to:
 * - avoid provider rate limits
 * - prevent memory pressure
 * - keep retries localized
 */
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
                    userId: data?.userId ?? "",
                    docId: data?.docId ?? "",
                    source: data?.fileName ?? "",
                },
            });

            // Explicitly log skipped outcomes (duplicates, guardrails, etc.)
            if (response?.status === "skipped") {
                console.warn("[worker] job skipped", {
                    jobId: job.id,
                    reason: response.reason,
                    docId: response.docId,
                    fingerprint: response.fingerprint,
                });

                return response;
            }

            const { totalDocuments, totalChunks, docId } = response;
            console.log(`Job ${job.id} completed successfully
                \nTotal Documents: ${totalDocuments}
                \nTotal Chuncks: ${totalChunks}
                \nDocument Id: ${docId}`);
        } catch (err) {
            console.error("[worker] job failed", {
                jobId: job.id,
                error: err,
            });

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

console.log("[worker] started and listening to file-upload-queue");
