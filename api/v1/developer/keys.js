const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../../../lib/supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth via Supabase JWT
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' });
  const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
  if (authErr || !user) return res.status(401).json({ error: 'Invalid auth' });

  // GET — list user's API keys
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, project_id, name, is_active, usage_count, last_used_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ keys: data || [] });
  }

  // POST — create a new API key
  if (req.method === 'POST') {
    const { name } = req.body || {};
    const projectId = uuidv4();
    const rawKey = `mv_${crypto.randomBytes(24).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 10);

    const { data, error } = await supabase.from('api_keys').insert({
      project_id: projectId,
      key_hash: hash,
      name: name || 'My API Key',
      user_id: user.id,
      is_active: true,
    }).select('id, project_id, name, created_at').single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({
      key: data,
      api_key: rawKey,
      prefix: keyPrefix,
      warning: 'Save this key now — it cannot be retrieved again',
    });
  }

  // DELETE — revoke an API key
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ revoked: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
