import { pipeline } from '@xenova/transformers';

// Singleton loader
let _embedderPromise: Promise<any> | null = null;

async function getEmbedder() {
  if (!_embedderPromise) {
    _embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return _embedderPromise;
}

// Returns Float32Array vector for a single string
export async function embedOne(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  // output is a TypedArray; convert to number[]
  return Array.from(output.data as Float32Array);
}

// Batch
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const extractor = await getEmbedder();
  const out = await extractor(texts, { pooling: 'mean', normalize: true });
  // out.data shape: [N, D]
  const data = out.data as Float32Array;
  // infer dims
  const dim = data.length / texts.length;
  const result: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    const start = i * dim;
    result.push(Array.from(data.slice(start, start + dim)));
  }
  return result;
}