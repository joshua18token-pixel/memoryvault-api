require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helper: generate embedding ---
async function embed(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

// --- Helper: authenticate API key ---
async function authenticate(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: 'Missing API key' });

  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const { data } = await supabase
    .from('api_keys')
    .select('project_id')
    .eq('key_hash', hash)
    .single();

  if (!data) return res.status(401).json({ error: 'Invalid API key' });
  req.projectId = data.project_id;
  next();
}

// --- POST /v1/memories — Store ---
app.post('/v1/memories', authenticate, async (req, res) => {
  try {
    const { namespace, content, type, importance, tags, metadata } = req.body;

    if (!namespace || !content) {
      return res.status(400).json({ error: 'namespace and content required' });
    }

    const embedding = await embed(content);

    const { data, error } = await supabase.from('memories').insert({
      project_id: req.projectId,
      namespace,
      content,
      embedding,
      type: type || 'semantic',
      importance: importance || 0.5,
      tags: tags || [],
      metadata: metadata || {},
    }).select('id, content, type, importance, tags, created_at').single();

    if (error) throw error;
    res.status(201).json({ memory: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST /v1/memories/recall — Semantic Search ---
app.post('/v1/memories/recall', authenticate, async (req, res) => {
  try {
    const { namespace, query, limit, min_importance } = req.body;

    if (!namespace || !query) {
      return res.status(400).json({ error: 'namespace and query required' });
    }

    const embedding = await embed(query);

    const { data, error } = await supabase.rpc('recall_memories', {
      query_embedding: embedding,
      p_project_id: req.projectId,
      p_namespace: namespace,
      p_limit: limit || 5,
      p_min_importance: min_importance || 0.0,
    });

    if (error) throw error;

    // Update access counts
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
});

// --- DELETE /v1/memories/:id — Forget One ---
app.delete('/v1/memories/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', req.params.id)
      .eq('project_id', req.projectId);

    if (error) throw error;
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE /v1/memories/namespace/:namespace — GDPR Wipe ---
app.delete('/v1/memories/namespace/:namespace', authenticate, async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('memories')
      .delete({ count: 'exact' })
      .eq('project_id', req.projectId)
      .eq('namespace', req.params.namespace);

    if (error) throw error;
    res.json({ deleted: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET /v1/memories — List/Filter ---
app.get('/v1/memories', authenticate, async (req, res) => {
  try {
    const { namespace, type, limit } = req.query;

    let query = supabase
      .from('memories')
      .select('id, content, type, importance, tags, metadata, created_at')
      .eq('project_id', req.projectId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit) || 20);

    if (namespace) query = query.eq('namespace', namespace);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ memories: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST /v1/api-keys — Generate API Key ---
app.post('/v1/api-keys', async (req, res) => {
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
});

// --- Health check ---
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'memoryvault' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MemoryVault API running on port ${PORT}`));
