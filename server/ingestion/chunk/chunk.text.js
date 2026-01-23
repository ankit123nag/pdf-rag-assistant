import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 10
});

export async function chunkDocuments(docs) {
    return splitter.splitDocuments(docs);
}
