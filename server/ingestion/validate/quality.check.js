export function validateChunks(chunks) {
    if (!chunks.length) {
        throw new Error("No chunks produced");
    }

    chunks.forEach(chunk => {
        if (chunk.pageContent.length < 20) {
            throw new Error("Chunk too small");
        }
    });
}
