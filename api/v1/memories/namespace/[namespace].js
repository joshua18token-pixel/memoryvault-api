const supabase = require('../../../../lib/supabase');
const { authenticate, cors } = require('../../../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const projectId = await authenticate(req);
  if (!projectId) return res.status(401).json({ error: 'Invalid or missing API key' });

  try {
    const { namespace } = req.query;

    const { error, count } = await supabase
      .from('memories')
      .delete({ count: 'exact' })
      .eq('project_id', projectId)
      .eq('namespace', namespace);

    if (error) throw error;
    res.json({ deleted: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
