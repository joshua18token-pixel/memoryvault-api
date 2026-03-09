const supabase = require('../../lib/supabase');
const { embed, extractMemories } = require('../../lib/openai');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Model pricing per 1K tokens
const MODEL_COSTS = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku': { input: 0.0008, output: 0.004 },
  'gemini-pro': { input: 0.00125, output: 0.005 },
};

// Map model IDs to actual API model names
const MODEL_MAP = {
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4o': 'gpt-4o',
  'gpt-4-turbo': 'gpt-4-turbo',
  'claude-3-5-sonnet': 'gpt-4o', // fallback to GPT-4o for now
  'claude-3-5-haiku': 'gpt-4o-mini', // fallback to GPT-4o-mini for now
  'gemini-pro': 'gpt-4o', // fallback for now
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, session_id, message, model, namespace } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ error: 'user_id and message required' });
    }

    // 1. Check user credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user_id)
      .single();

    if (!profile || profile.credits <= 0) {
      return res.status(402).json({ error: 'Insufficient credits. Please add funds to continue.' });
    }

    // 2. Recall relevant memories
    let memoryContext = '';
    try {
      const queryEmbed = await embed(message);
      const { data: memories } = await supabase.rpc('recall_memories', {
        query_embedding: queryEmbed,
        p_project_id: 'consumer',
        p_namespace: namespace || `user_${user_id}`,
        p_limit: 5,
        p_min_importance: 0.2,
      });
      if (memories?.length > 0) {
        memoryContext = '\n\nUser memories (things you know about this person):\n' +
          memories.map(m => `- ${m.content}`).join('\n');
      }
    } catch { /* no memories yet, that's fine */ }

    // 3. Load recent chat history
    let chatHistory = [];
    if (session_id) {
      const { data: recentMsgs } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true })
        .limit(20);
      if (recentMsgs) {
        chatHistory = recentMsgs.map(m => ({ role: m.role, content: m.content }));
      }
    }

    // 4. Build prompt with memory context
    const systemPrompt = `You are a helpful AI assistant with persistent memory. You remember things about the user across conversations.

Be conversational, helpful, and personable. When the user shares information about themselves, acknowledge it naturally. You can reference things you remember about them.

If the user asks what you remember, share the relevant memories naturally.${memoryContext}`;

    const messages_arr = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message },
    ];

    // 5. Call the AI model
    const modelId = MODEL_MAP[model] || 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: messages_arr,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated.';
    const usage = completion.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;

    // 6. Calculate cost
    const costs = MODEL_COSTS[model] || MODEL_COSTS['gpt-4o-mini'];
    const cost = (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;

    // 7. Save assistant message
    let messageId = null;
    if (session_id) {
      const { data: savedMsg } = await supabase.from('chat_messages').insert({
        session_id,
        user_id,
        role: 'assistant',
        content: response,
        model: model || 'gpt-4o-mini',
        tokens_used: inputTokens + outputTokens,
        cost,
      }).select('id').single();
      messageId = savedMsg?.id;
    }

    // 8. Deduct credits
    await supabase
      .from('profiles')
      .update({
        credits: Math.max(0, profile.credits - cost),
        total_spent: (profile.total_spent || 0) + cost,
      })
      .eq('id', user_id);

    // Log credit transaction
    await supabase.from('credit_transactions').insert({
      user_id,
      amount: -cost,
      type: 'usage',
      description: `Chat message (${model || 'gpt-4o-mini'}, ${inputTokens + outputTokens} tokens)`,
      model: model || 'gpt-4o-mini',
    });

    // 9. Auto-extract and store memories from the conversation
    try {
      const convoSnippet = `User: ${message}\nAssistant: ${response}`;
      const extracted = await extractMemories(convoSnippet);
      if (Array.isArray(extracted) && extracted.length > 0) {
        for (const mem of extracted) {
          const memEmbed = await embed(mem.content);
          await supabase.from('memories').insert({
            project_id: 'consumer',
            namespace: namespace || `user_${user_id}`,
            content: mem.content,
            embedding: memEmbed,
            type: mem.type || 'semantic',
            importance: mem.importance || 0.5,
            tags: mem.tags || [],
            metadata: { source: 'auto-chat', session_id },
          });
        }
      }
    } catch { /* memory extraction is best-effort */ }

    res.json({
      response,
      message_id: messageId,
      model: model || 'gpt-4o-mini',
      tokens: inputTokens + outputTokens,
      cost: parseFloat(cost.toFixed(6)),
      credits_remaining: parseFloat((profile.credits - cost).toFixed(4)),
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
};
