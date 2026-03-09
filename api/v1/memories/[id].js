const supabase = require('../../../lib/supabase');
const { authenticate, cors } = require('../../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const projectId = await authenticate(req);
  if (!projectId) return res.status(401).json({ error: 'Invalid or missing API key' });

  const { id } = req.query;

  // DELETE — Forget a specific memory
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
      return res.json({ deleted: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT — Update a memory
  if (req.method === 'PUT') {
    try {
      const { content, importance, tags, metadata } = req.body;
      const updates = {};
      if (content !== undefined) updates.content = content;
      if (importance !== undefined) updates.importance = importance;
      if (tags !== undefined) updates.tags = tags;
      if (metadata !== undefined) updates.metadata = metadata;

      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .eq('project_id', projectId)
        .select('id, content, type, importance, tags, metadata, created_at')
        .single();

      if (error) throw error;
      return res.json({ memory: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
