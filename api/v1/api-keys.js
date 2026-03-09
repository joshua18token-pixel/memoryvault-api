const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../../lib/supabase');
const { cors } = require('../../lib/auth');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, admin_secret } = req.body;

  if (admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const projectId = uuidv4();
  const rawKey = `mv_${crypto.randomBytes(24).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

  const { error } = await supabase.from('api_keys').insert({
    project_id: projectId,
    key_hash: hash,
    name: name || 'default',
  });

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({
    project_id: projectId,
    api_key: rawKey,
    warning: 'Save this key — it cannot be retrieved again',
  });
};
