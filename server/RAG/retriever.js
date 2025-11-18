const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');

const storePath = path.join(__dirname, 'vectorStore.json');
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

function loadStore() {
  if (!fs.existsSync(storePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return data.chunks || [];
  } catch (e) {
    console.error('Failed to load vector store', e);
    return [];
  }
}

function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

async function retrieve(query, k = 4, opts = {}) {
  const { filename } = opts || {};
  const chunks = loadStore();
  if (!chunks.length) return [];

  const candidates = filename
    ? chunks.filter((c) => c.filename === filename)
    : chunks;

  const pool = candidates.length ? candidates : chunks;

  const embResp = await mistral.embeddings.create({ model: 'mistral-embed', inputs: [query] });
  const q = embResp.data?.[0]?.embedding;
  if (!q) return [];

  const scored = pool.map(c => ({ ...c, score: cosine(q, c.embedding) }));
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

module.exports = { retrieve };
