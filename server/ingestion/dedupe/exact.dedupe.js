import crypto from "crypto";

export function exactDedupe(docs) {
    const seen = new Set();

    return docs.filter(doc => {
        const hash = crypto
            .createHash("sha256")
            .update(doc.pageContent)
            .digest("hex");

        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
    });
}
