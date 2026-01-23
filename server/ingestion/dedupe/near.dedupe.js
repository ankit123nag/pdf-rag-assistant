import natural from "natural";

const tokenizer = new natural.WordTokenizer();

export function nearDedupe(docs, threshold = 0.9) {
    const kept = [];

    for (const doc of docs) {
        const tokens = tokenizer.tokenize(doc.pageContent);

        let isDuplicate = false;

        for (const existing of kept) {
            const sim = natural.JaroWinklerDistance(
                doc.pageContent.slice(0, 500),
                existing.pageContent.slice(0, 500)
            );

            if (sim > threshold) {
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) kept.push(doc);
    }

    return kept;
}
