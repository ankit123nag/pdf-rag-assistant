export function attachMetadata(chunks, baseMeta) {
    return chunks.map((chunk, index) => ({
        ...chunk,
        metadata: {
            ...baseMeta,
            chunkIndex: index
        }
    }));
}
