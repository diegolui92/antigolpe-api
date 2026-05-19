const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== SUPABASE ====================

const supabase = createClient(
  "https://ojuiufrckgwndhqnqxmo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc"
);

// ==================== FUNÇÕES ====================

function gerarApiKey() {
  return "ag_" + crypto.randomBytes(16).toString("hex");
}

function detectarTipo(texto) {
  const valor = texto.trim();

  if (valor.includes("@")) {
    return "EMAIL";
  }

  if (
    valor.startsWith("http") ||
    valor.startsWith("www.") ||
    valor.includes(".com") ||
    valor.includes(".xyz") ||
    valor.includes(".net")
  ) {
    return "SITE";
  }

  const somenteNumeros = valor.replace(/\D/g, "");

  if (somenteNumeros.length >= 10 && somenteNumeros.length <= 13) {
    return "TELEFONE";
  }

  return "TEXTO";
}

function analisarRiscoLocal(texto) {
  const t = texto.toLowerCase();

  let score = 0;
  let motivos = [];

  // PIX
  if (t.includes("pix")) {
    score += 40;
    motivos.push("PIX suspeito");
  }

  // urgência
  if (
    t.includes("urgente") ||
    t.includes("agora") ||
    t.includes("últimas vagas")
  ) {
    score += 30;
    motivos.push("Urgência");
  }

  // promessa falsa
  if (
    t.includes("ganhe dinheiro") ||
    t.includes("renda extra") ||
    t.includes("lucro garantido")
  ) {
    score += 40;
    motivos.push("Promessa suspeita");
  }

  // links estranhos
  if (
    t.includes(".xyz") ||
    t.includes(".top") ||
    t.includes(".click") ||
    t.includes(".vip")
  ) {
    score += 40;
    motivos.push("Domínio suspeito");
  }

  // encurtador
  if (
    t.includes("bit.ly") ||
    t.includes("tinyurl") ||
    t.includes("cutt.ly")
  ) {
    score += 35;
    motivos.push("Link encurtado");
  }

  // whatsapp golpe
  if (
    t.includes("clique aqui") ||
    t.includes("acessar agora")
  ) {
    score += 25;
    motivos.push("Indução ao clique");
  }

  let status = "SEGURO";

  if (score >= 80) {
    status = "ALTO RISCO";
  } else if (score >= 40) {
    status = "SUSPEITO";
  }

  return {
    score,
    status,
    motivos,
  };
}

// ==================== VERIFICAR ====================

app.post("/api/verificar", async (req, res) => {
  try {
    const { texto, api_key } = req.body;

    if (!texto) {
      return res.status(400).json({
        erro: "Texto não enviado",
      });
    }
// ==================== DENÚNCIAS ====================

app.post("/api/denunciar", async (req, res) => {
  try {
    const { valor, motivo, detalhes } = req.body;

    if (!valor) {
      return res.status(400).json({
        erro: "Valor não enviado",
      });
    }

    const tipo = detectarTipo(valor);

    // salva denúncia
    await supabase.from("denuncias").insert({
      valor,
      tipo,
      motivo,
      detalhes,
    });

    // verifica reputação existente
    const { data: reputacao } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", valor)
      .limit(1);

    if (reputacao && reputacao.length > 0) {
      const atual = reputacao[0];

      let novaPontuacao = (atual.pontuacao || 0) + 40;

      let novoStatus = "SUSPEITO";

      if (novaPontuacao >= 80) {
        novoStatus = "ALTO RISCO";
      }

      await supabase
        .from("reputacoes")
        .update({
          pontuacao: novaPontuacao,
          denuncias: (atual.denuncias || 0) + 1,
          status: novoStatus,
        })
        .eq("id", atual.id);
    } else {
      // cria reputação inicial
      await supabase.from("reputacoes").insert({
        valor,
        tipo,
        pontuacao: 40,
        denuncias: 1,
        status: "SUSPEITO",
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Denúncia registrada",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      erro: "Erro ao denunciar",
    });
  }
});
    // ====================
    // CONSULTA LISTA NEGRA
    // ====================

    const { data: blacklist } = await supabase
      .from("lista_negra")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    if (blacklist && blacklist.length > 0) {
      return res.json({
        tipo: blacklist[0].tipo || detectarTipo(texto),
        status: "ALTO RISCO",
        score: 100,
        motivo:
          blacklist[0].motivo || "Encontrado na lista negra",
      });
    }

    // ====================
    // CONSULTA REPUTAÇÃO
    // ====================

    const { data: reputacao } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    if (reputacao && reputacao.length > 0) {
      return res.json({
        tipo: reputacao[0].tipo || detectarTipo(texto),
        status: reputacao[0].status || "SEGURO",
        score: reputacao[0].pontuacao || 0,
        motivo: "Resultado vindo da reputação do banco",
      });
    }

    // ====================
    // ANÁLISE LOCAL IA
    // ====================

    const tipo = detectarTipo(texto);

    const analise = analisarRiscoLocal(texto);

    // ====================
    // SALVAR REPUTAÇÃO
    // ====================

    await supabase.from("reputacoes").insert({
      valor: texto,
      tipo,
      pontuacao: analise.score,
      status: analise.status,
      denuncias: 0,
    });

    return res.json({
      tipo,
      status: analise.status,
      score: analise.score,
      motivo:
        analise.motivos.length > 0
          ? analise.motivos.join(" | ")
          : "Nenhum risco encontrado",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
});

// ==================== API KEY ====================

app.get("/gerar-chave", (req, res) => {
  const chave = gerarApiKey();

  return res.json({
    api_key: chave,
  });
});

// ==================== START ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor AntiGolpe rodando");
});