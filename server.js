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
  try {
    const { nome, limite } = req.body;

    const novaChave = gerarApiKey();

    const { error } = await supabase.from('api_keys').insert([
      {
        chave: novaChave,
        nome: nome || 'Cliente',
        limite: limite || 100,
        uso: 0
      }
    ]);

    if (error) {
      console.log('ERRO BANCO:', error);
      return res.status(500).json({ erro: 'Erro ao criar chave' });
    }

    return res.json({
      sucesso: true,
      api_key: novaChave
    });

  } catch (err) {
    console.log('ERRO SERVIDOR:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ================= VALIDAR API KEY =================
async function validarChave(apiKey) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('chave', apiKey)
    .single();

  if (error || !data) {
    return { ok: false };
  }

  if (data.uso >= data.limite) {
    return { ok: false, motivo: 'limite atingido' };
  }

  // Atualiza uso
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

  const t = (texto || '').toLowerCase();

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
  try {
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

    return res.json({
      tipo,
      status,
      score: analise.score,
      mensagem: analise.motivos.join(' | ')
    });

  } catch (err) {
    console.log('ERRO VERIFICAR:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.send('API AntiGolpe rodando 🚀');
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});