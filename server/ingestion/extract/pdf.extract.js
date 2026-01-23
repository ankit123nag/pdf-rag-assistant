import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function extractPdf(path) {
    const loader = new PDFLoader(path);
    return loader.load();
}
