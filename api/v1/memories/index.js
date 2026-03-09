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

      // Deduplication: check for similar existing memories
      const { data: similar } = await supabase.rpc('recall_memories', {
        query_embedding: embedding,
        p_project_id: projectId,
        p_namespace: namespace,
        p_limit: 1,
        p_min_importance: 0.0,
      });

      if (similar && similar.length > 0 && similar[0].similarity > 0.85) {
        // Update existing instead of creating duplicate
        const existing = similar[0];
        const mergedTags = [...new Set([...(existing.tags || []), ...(tags || [])])];
        const { data, error } = await supabase.from('memories')
          .update({
            content,
            importance: Math.max(existing.importance || 0.5, importance || 0.5),
            tags: mergedTags,
            last_accessed_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select('id, content, type, importance, tags, created_at')
          .single();
        if (error) throw error;
        return res.status(200).json({ memory: data, deduplicated: true });
      }

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
