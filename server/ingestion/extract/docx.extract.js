import mammoth from "mammoth";
import { Document } from "@langchain/core/documents";

export async function extractDocx(path) {
    const result = await mammoth.extractRawText({ path });

    return [
        new Document({
            pageContent: result.value,
        }),
    ];
}
