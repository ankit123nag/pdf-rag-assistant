import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { Document } from "@langchain/core/documents";

export async function extractHtml(html) {
    const dom = new JSDOM(html);
    const article = new Readability(dom.window.document).parse();

    if (!article) return [];

    return [
        new Document({
            pageContent: article.textContent,
            metadata: { title: article.title },
        }),
    ];
}
