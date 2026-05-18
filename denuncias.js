const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojuiufrckgwndhqnqxmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc'
);

// 🚨 REGISTRAR DENÚNCIA
router.post('/denunciar', async (req, res) => {

  const { texto, tipo } = req.body;

  if (!texto) {
    return res.status(400).json({ erro: 'Texto obrigatório' });
  }

  const { error } = await supabase
    .from('denuncias')
    .insert([{ texto, tipo }]);

  if (error) {
    return res.status(500).json({ erro: 'Erro ao salvar denúncia' });
  }

  res.json({ sucesso: true, msg: 'Denúncia registrada' });
});

module.exports = router;