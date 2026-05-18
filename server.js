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

    const { error } = await supabase.from('chaves_api').insert([
      {
        chave: novaChave,
        nome: nome || 'Cliente',
        limite: limite || 100,
        uso: 0
      }
    ]);

    if (error) {
      console.log('ERRO SUPABASE:', error);
      return res.status(500).json({ erro: 'Erro ao salvar no banco' });
    }

    res.json({
      sucesso: true,
      api_key: novaChave
    });

  } catch (err) {
    console.log('ERRO GERAL:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// ================= START =================
app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});