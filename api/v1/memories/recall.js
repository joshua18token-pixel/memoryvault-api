const supabase = require('../../../lib/supabase');
const { embed } = require('../../../lib/openai');
const { authenticate, cors } = require('../../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const projectId = await authenticate(req);
  if (!projectId) return res.status(401).json({ error: 'Invalid or missing API key' });

  try {
    const { namespace, query, limit, min_importance } = req.body;
    if (!namespace || !query) {
      return res.status(400).json({ error: 'namespace and query required' });
    }

    const embedding = await embed(query);

    const { data, error } = await supabase.rpc('recall_memories', {
      query_embedding: embedding,
      p_project_id: projectId,
      p_namespace: namespace,
      p_limit: limit || 5,
      p_min_importance: min_importance || 0.0,
    });

    if (error) throw error;

    // Update access timestamps
    const ids = data.map(m => m.id);
    if (ids.length > 0) {
      await supabase
        .from('memories')
        .update({ last_accessed_at: new Date().toISOString() })
        .in('id', ids);
    }

    res.json({ memories: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
