import { extractPdf } from "./pdf.extract.js";
import { extractHtml } from "./html.extract.js";
import { extractDocx } from "./docx.extract.js";
import { extractText } from "./text.extract.js";

export async function extractDocument({ type, source }) {
    
    switch (type) {
        case "pdf":
            return extractPdf(source);
        case "html":
            return extractHtml(source);
        case "docx":
            return extractDocx(source);
        case "txt":
            return extractText(source);
        default:
            throw new Error(`Unsupported document type: ${type}`);
    }
}
