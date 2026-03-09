const OpenAI = require('openai');
const { extractMemories } = require('../../lib/openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // Limit free trial to 8 exchanges
    if (history && history.length > 16) {
      return res.json({
        response: "I'm really enjoying our conversation! To keep chatting and save everything I've learned about you, sign up for a free account. You'll get $1.00 in credits and I'll remember you forever. 🧠",
        memories: [],
        limit_reached: true,
      });
    }

    // Extract memories from conversation so far for context
    let memoryContext = '';
    let extractedMemories = [];
    if (history && history.length > 2) {
      try {
        const convoText = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
        extractedMemories = await extractMemories(convoText);
        if (extractedMemories.length > 0) {
          memoryContext = '\n\nThings you\'ve learned about this person so far:\n' +
            extractedMemories.map(m => `- ${m.content}`).join('\n');
        }
      } catch { /* best effort */ }
    }

    const systemPrompt = `You are a personal AI assistant on the MemoryVault homepage. Think of yourself as Alfred Pennyworth — loyal, warm, witty, and deeply competent.

Your goal: have a genuine, engaging conversation that shows the visitor what it's like to have an AI that truly knows them. Make them want to sign up.

Guidelines:
- Be warm and personal. Use their name if they share it.
- Ask follow-up questions to learn more about them
- Show that you're paying attention to details
- After 3-4 exchanges, naturally mention something they told you earlier to demonstrate memory
- Be concise — this is a demo, keep responses 2-3 sentences
- Be genuinely helpful and interesting, not salesy${memoryContext}`;

    const messages_arr = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10), // keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages_arr,
      max_tokens: 256,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || "Tell me more about yourself!";

    res.json({
      response,
      memories: extractedMemories.map(m => ({ content: m.content, tags: m.tags || [] })),
    });
  } catch (err) {
    console.error('Try-chat error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
