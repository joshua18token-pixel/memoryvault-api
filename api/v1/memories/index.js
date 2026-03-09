const supabase = require('../../../lib/supabase');
const { embed } = require('../../../lib/openai');
const { authenticate, cors } = require('../../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const projectId = await authenticate(req);
  if (!projectId) return res.status(401).json({ error: 'Invalid or missing API key' });

  // POST — Store a memory
  if (req.method === 'POST') {
    try {
      const { namespace, content, type, importance, tags, metadata } = req.body;
      if (!namespace || !content) {
        return res.status(400).json({ error: 'namespace and content required' });
      }

      const embedding = await embed(content);

      const { data, error } = await supabase.from('memories').insert({
        project_id: projectId,
        namespace,
        content,
        embedding,
        type: type || 'semantic',
        importance: importance || 0.5,
        tags: tags || [],
        metadata: metadata || {},
      }).select('id, content, type, importance, tags, created_at').single();

      if (error) throw error;
      return res.status(201).json({ memory: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET — List/filter memories
  if (req.method === 'GET') {
    try {
      const { namespace, type, limit } = req.query;

      let query = supabase
        .from('memories')
        .select('id, content, type, importance, tags, metadata, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit) || 20);

      if (namespace) query = query.eq('namespace', namespace);
      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ memories: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
