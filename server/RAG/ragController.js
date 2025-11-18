const { retrieve } = require("./retriever");
const { Mistral } = require("@mistralai/mistralai");
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function chat(req, res) {
  try {
    const { message, filename } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const contextChunks = await retrieve(message, 4, filename ? { filename } : {});
    if (!contextChunks.length) {
      return res.json({
        answer: "I couldn’t find anything relevant in the uploaded documents.",
        sources: [],
      });
    }

    const contextText = contextChunks
      .map((c) => `Source: ${c.filename}\n${c.text}`)
      .join("\n---\n");

    const completion = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            "Answer only using the provided context. If the context is empty or doesn’t contain the answer, say you don’t know and cite filenames when you do answer.",
        },
        {
          role: "user",
          content: `Context:\n${contextText}\n\nQuestion: ${message}`,
        },
      ],
    });

    return res.json({
      answer: completion.choices?.[0]?.message?.content || "",
      sources: contextChunks,
    });
  } catch (err) {
    console.error("RAG chat error", err);
    return res.status(500).json({ error: "server error" });
  }
}

module.exports = { chat };
