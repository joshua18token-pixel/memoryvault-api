const supabase = require('../../../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
  if (authErr || !user) return res.status(401).json({ error: 'Invalid auth' });

  // Get user's project IDs
  const { data: keys } = await supabase
    .from('api_keys')
    .select('project_id')
    .eq('user_id', user.id);

  const projectIds = (keys || []).map(k => k.project_id);

  if (projectIds.length === 0) {
    return res.json({
      total_memories: 0,
      total_api_calls: 0,
      total_cost: 0,
      memories_by_namespace: [],
      daily_usage: [],
    });
  }

  // Count memories across all projects
  const { count: totalMemories } = await supabase
    .from('memories')
    .select('id', { count: 'exact', head: true })
    .in('project_id', projectIds);

  // Get profile for credits/spend info
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, total_spent, tier')
    .eq('id', user.id)
    .single();

  // Get memory counts grouped by namespace (top 10)
  const { data: namespaces } = await supabase
    .from('memories')
    .select('namespace')
    .in('project_id', projectIds);

  const nsCounts = {};
  (namespaces || []).forEach(m => {
    nsCounts[m.namespace] = (nsCounts[m.namespace] || 0) + 1;
  });
  const topNamespaces = Object.entries(nsCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([namespace, count]) => ({ namespace, count }));

  res.json({
    total_memories: totalMemories || 0,
    total_api_calls: (keys || []).reduce((sum, k) => sum + (k.usage_count || 0), 0),
    credits_remaining: profile?.credits || 0,
    total_spent: profile?.total_spent || 0,
    tier: profile?.tier || 'free',
    memories_by_namespace: topNamespaces,
    project_count: projectIds.length,
  });
};
