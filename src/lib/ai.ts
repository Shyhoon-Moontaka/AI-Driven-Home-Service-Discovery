import { pipeline } from "@huggingface/transformers";

let extractor: any = null;

async function loadExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

export async function generateEmbeddings(text: string): Promise<number[]> {
  const extractor = await loadExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

export async function calculateSimilarity(
  embedding1: number[],
  embedding2: number[]
): Promise<number> {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same length");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  return dotProduct / (norm1 * norm2);
}

export async function recommendServices(
  userQuery: string,
  serviceDescriptions: string[]
): Promise<number[]> {
  const queryEmbedding = await generateEmbeddings(userQuery);
  const similarities: number[] = [];

  for (const description of serviceDescriptions) {
    const serviceEmbedding = await generateEmbeddings(description);
    const similarity = await calculateSimilarity(
      queryEmbedding,
      serviceEmbedding
    );
    similarities.push(similarity);
  }

  return similarities;
}
