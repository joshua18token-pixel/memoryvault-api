const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

async function extractMemories(conversation) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `You are a memory extraction engine. Given a conversation, extract discrete facts, preferences, and events worth remembering about the user.

Return a JSON array of objects with:
- "content": the memory as a concise statement
- "type": "semantic" (facts), "episodic" (events), or "procedural" (preferences/habits)
- "importance": 0.0-1.0 (how important this is to remember)
- "tags": array of relevant tags

Only extract genuinely useful memories. Skip small talk and filler. Be concise but complete.
Return ONLY the JSON array, no markdown or explanation.`,
      },
      {
        role: 'user',
        content: conversation,
      },
    ],
  });

  try {
    const text = res.choices[0].message.content.trim();
    // Handle potential markdown code blocks
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse extracted memories');
  }
}

module.exports = { openai, embed, extractMemories };
