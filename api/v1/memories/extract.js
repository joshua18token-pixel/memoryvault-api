const supabase = require('../../../lib/supabase');
const { embed, extractMemories } = require('../../../lib/openai');
const { authenticate, cors } = require('../../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const projectId = await authenticate(req);
  if (!projectId) return res.status(401).json({ error: 'Invalid or missing API key' });

  try {
    const { namespace, conversation } = req.body;
    if (!namespace || !conversation) {
      return res.status(400).json({ error: 'namespace and conversation required' });
    }

    // Step 1: Use LLM to extract memories from raw conversation
    const extracted = await extractMemories(conversation);

    if (!Array.isArray(extracted) || extracted.length === 0) {
      return res.json({ memories: [], message: 'No memories worth extracting' });
    }

    // Step 2: Embed and store each extracted memory
    const stored = [];
    for (const mem of extracted) {
      const embedding = await embed(mem.content);

      const { data, error } = await supabase.from('memories').insert({
        project_id: projectId,
        namespace,
        content: mem.content,
        embedding,
        type: mem.type || 'semantic',
        importance: mem.importance || 0.5,
        tags: mem.tags || [],
        metadata: { source: 'auto-extraction' },
      }).select('id, content, type, importance, tags, created_at').single();

      if (error) throw error;
      stored.push(data);
    }

    res.status(201).json({
      memories: stored,
      count: stored.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
