import fs from "fs";
import { Document } from "@langchain/core/documents";

export async function extractText(path) {
    const text = fs.readFileSync(path, "utf8");

    return [
        new Document({
            pageContent: text,
        }),
    ];
}
