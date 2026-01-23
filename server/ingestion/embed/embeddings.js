import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
// import { OpenAIEmbeddings } from "@langchain/openai";

export function createEmbeddings() {
    // Initializing OpenAI Embeddings
    // return new OpenAIEmbeddings({
    //     model: "text-embedding-3-small",
    //     apiKey: process.env.OPENAI_API_KEY
    // });
    return new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACEHUB_API_KEY,
        model: "sentence-transformers/all-mpnet-base-v2",
        provider: "hf-inference",
    });
}
