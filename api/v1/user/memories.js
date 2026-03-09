const supabase = require('../../../lib/supabase');
const { embed } = require('../../../lib/openai');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Authenticate via Supabase JWT from Authorization header
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  const token = auth.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }

  const namespace = `user_${user.id}`;

  // GET — list all memories for this user
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('id, content, type, importance, tags, metadata, created_at')
        .eq('project_id', 'consumer')
        .eq('namespace', namespace)
        .order('importance', { ascending: false })
        .limit(20);

      if (error) throw error;
      return res.json({ memories: data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — semantic search memories
  if (req.method === 'POST') {
    try {
      const { query, limit } = req.body;
      if (!query) return res.status(400).json({ error: 'query required' });

      const embedding = await embed(query);

      const { data, error } = await supabase.rpc('recall_memories', {
        query_embedding: embedding,
        p_project_id: 'consumer',
        p_namespace: namespace,
        p_limit: limit || 10,
        p_min_importance: 0.0,
      });

      if (error) throw error;
      return res.json({ memories: data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
