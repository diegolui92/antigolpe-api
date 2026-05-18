const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ================= CONFIG =================
const supabase = createClient(
  'https://ojuiufrckgwndhqnqxmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc'
);

// ================= GERAR API KEY =================
function gerarApiKey() {
  return 'ag_' + crypto.randomBytes(16).toString('hex');
}

// ================= CRIAR API KEY =================
app.post('/api/criar-chave', async (req, res) => {
  const { nome, limite } = req.body;

  const novaChave = gerarApiKey();

  const { error } = await supabase.from('chaves_api').insert([
    {
      chave: novaChave,
      nome: nome || 'Cliente',
      limite: limite || 100,
      uso: 0
    }
  ]);

  if (error) {
    return res.status(500).json({ erro: 'Erro ao criar chave' });
  }

  res.json({
    sucesso: true,
    api_key: novaChave
  });
});

// ================= VALIDAR API KEY =================
async function validarChave(apiKey) {
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('chave', apiKey)
    .single();

  if (!data) return { ok: false };

  if (data.uso >= data.limite) {
    return { ok: false, motivo: 'limite atingido' };
  }

  // atualizar uso
  await supabase
    .from('api_keys')
    .update({ uso: data.uso + 1 })
    .eq('id', data.id);

  return { ok: true };
}

// ================= IA ANTIGOLPE =================
function analisarIA(texto) {
  let score = 0;
  let motivos = [];

  const t = texto.toLowerCase();

  if (t.includes('pix')) {
    score += 40;
    motivos.push('PIX suspeito');
  }

  if (t.includes('urgente')) {
    score += 30;
    motivos.push('Urgência');
  }

  if (t.includes('clique')) {
    score += 30;
    motivos.push('Indução a clique');
  }

  if (t.includes('ganhe dinheiro')) {
    score += 40;
    motivos.push('Promessa suspeita');
  }

  return { score, motivos };
}

// ================= VERIFICAR =================
app.post('/api/verificar', async (req, res) => {
  const { texto, tipo, api_key } = req.body;

  if (!api_key) {
    return res.status(401).json({ erro: 'API KEY obrigatória' });
  }

  const validacao = await validarChave(api_key);

  if (!validacao.ok) {
    return res.status(403).json({ erro: 'API KEY inválida ou limite atingido' });
  }

  const analise = analisarIA(texto);

  let status = 'SEGURO';
  if (analise.score > 60) status = 'ALTO RISCO';
  else if (analise.score > 30) status = 'SUSPEITO';

  res.json({
    tipo,
    status,
    score: analise.score,
    mensagem: analise.motivos.join(' | ')
  });
});

// ================= START =================
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});