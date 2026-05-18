const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const denunciasRoute = require('./denuncias');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', denunciasRoute);

// ================= CONFIG =================
const GOOGLE_API_KEY = 'SUA_API_KEY_AQUI';

const supabase = createClient(
  'https://ojuiufrckgwndhqnqxmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc'
);

// ================= IA MELHORADA =================
function analisarIA(texto) {
  let score = 0;
  let motivos = [];
  const t = texto.toLowerCase();

  if (t.includes('urgente')) { score += 30; motivos.push('Urgência'); }
  if (t.includes('ganhe') || t.includes('promo')) { score += 30; motivos.push('Promessa suspeita'); }
  if (t.includes('clique')) { score += 20; motivos.push('Indução a clique'); }
  if (t.includes('pix')) { score += 20; motivos.push('Pedido de PIX'); }
  if (t.includes('senha')) { score += 40; motivos.push('Tentativa de roubo de dados'); }

  return { score, motivos };
}

// ================= VALIDADORES =================
const num = v => v.replace(/\D/g, '');

const isCPF = v => num(v).length === 11;

const isTelefone = v => {
  const n = num(v);
  return (n.length === 10 || n.length === 11) && !isCPF(v);
};

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isLink = v => v.includes('.') && !v.includes('@');
const isAleatoria = v => /^[a-zA-Z0-9]{20,}$/.test(v);

// ================= GOOGLE =================
async function verificarGoogle(url) {
  try {
    const r = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client: { clientId: "app", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
          }
        }),
      }
    );

    const data = await r.json();

    if (data.matches) {
      return { score: 80, msg: 'Ameaça detectada pelo Google' };
    }

    return { score: 10, msg: 'Link não confiável (sem reputação)' };

  } catch {
    return { score: 40, msg: 'Erro ao consultar Google' };
  }
}

// ================= DENÚNCIAS =================
async function buscarDenuncias(texto) {
  const { count } = await supabase
    .from('denuncias')
    .select('*', { count: 'exact', head: true })
    .eq('texto', texto);

  return count || 0;
}

// ================= CLASSIFICADOR =================
function classificar(texto) {
  if (isEmail(texto)) return 'PIX_EMAIL';
  if (isCPF(texto)) return 'PIX_CPF';
  if (isTelefone(texto)) return 'TELEFONE';
  if (isAleatoria(texto)) return 'PIX_ALEATORIA';
  if (isLink(texto)) return 'LINK';
  return 'DESCONHECIDO';
}

// ================= API =================
app.post('/api/verificar', async (req, res) => {

  const { texto } = req.body;

  let score = 0;
  let mensagens = [];

  const tipo = classificar(texto);

  const ia = analisarIA(texto);
  score += ia.score;
  mensagens.push(...ia.motivos);

  if (tipo === 'LINK') {
    const google = await verificarGoogle(texto);
    score += google.score;
    mensagens.push(google.msg);
  }

  const qtd = await buscarDenuncias(texto);
  if (qtd > 0) {
    score += qtd * 30;
    mensagens.push(`🚨 ${qtd} denúncia(s)`);
  }

  let status = 'SEGURO';
  if (score >= 80) status = 'ALTO RISCO';
  else if (score >= 40) status = 'SUSPEITO';

  res.json({
    tipo,
    status,
    score,
    mensagem: mensagens.join(' | ')
  });
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 API ANTIGOLPE ONLINE');
});