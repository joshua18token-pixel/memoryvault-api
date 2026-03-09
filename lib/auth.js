const crypto = require('crypto');
const supabase = require('./supabase');

async function authenticate(req) {
  const key = req.headers['x-api-key'];
  if (!key) return null;

  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const { data } = await supabase
    .from('api_keys')
    .select('project_id')
    .eq('key_hash', hash)
    .single();

  return data?.project_id || null;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

module.exports = { authenticate, cors };
