export function dedupeDocuments(docs) {
    const seen = new Set();

    return docs.filter(doc => {
        const hash = doc.pageContent.slice(0, 200);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
    });
}
