const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  "https://ojuiufrckgwndhqnqxmo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc"
);

// =========================
// FUNÇÕES
// =========================

function detectarTipo(texto) {
  if (!texto) return "DESCONHECIDO";

  if (texto.includes("@")) return "EMAIL";

  if (
    texto.includes(".com") ||
    texto.includes(".net") ||
    texto.includes(".org") ||
    texto.includes(".xyz")
  ) {
    return "SITE";
  }

  if (texto.length >= 11 && texto.length <= 14) {
    return "TELEFONE";
  }

  return "PIX";
}

function calcularStatus(score) {
  if (score >= 80) return "ALTO RISCO";
  if (score >= 40) return "SUSPEITO";
  return "SEGURO";
}

// =========================
// VERIFICAR
// =========================

app.post("/api/verificar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({
        erro: "Texto não enviado",
      });
    }

    const tipo = detectarTipo(texto);

    // BUSCA LISTA NEGRA
    const { data: blacklist } = await supabase
      .from("lista_negra")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    // BUSCA REPUTAÇÃO
    const { data: reputacao } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    // MOTIVOS
    const { data: denuncias } = await supabase
      .from("denuncias")
      .select("*")
      .eq("valor", texto);

    let motivos = [];

    if (denuncias && denuncias.length > 0) {
      motivos = denuncias.map((d) => d.motivo);
    }

    // SE ESTÁ NA LISTA NEGRA
    if (blacklist && blacklist.length > 0) {
      return res.json({
        tipo,
        status: "ALTO RISCO",
        score: 100,
        motivo: "Item presente na lista negra",
        denuncias: motivos.length,
        motivos,
      });
    }

    // SE TEM REPUTAÇÃO
    if (reputacao && reputacao.length > 0) {
      return res.json({
        tipo,
        status: reputacao[0].status,
        score: reputacao[0].pontuacao,
        motivo: "Resultado vindo da reputação do banco",
        denuncias: reputacao[0].denuncias || 0,
        motivos,
      });
    }

    // ANÁLISE AUTOMÁTICA
    let score = 0;
    let motivo = "Nenhum risco encontrado";

    if (
      texto.includes(".xyz") ||
      texto.includes("promo") ||
      texto.includes("gratis")
    ) {
      score += 40;
      motivo = "Domínio suspeito";
    }

    if (texto.includes("suporte")) {
      score += 20;
    }

    const status = calcularStatus(score);

    return res.json({
      tipo,
      status,
      score,
      motivo,
      denuncias: motivos.length,
      motivos,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      erro: "Erro ao verificar",
    });
  }
});

// =========================
// DENUNCIAR
// =========================

app.post("/api/denunciar", async (req, res) => {
  try {
    const { valor, motivo, detalhes } = req.body;

    if (!valor) {
      return res.status(400).json({
        erro: "Valor não enviado",
      });
    }

    const tipo = detectarTipo(valor);

    // SALVA DENÚNCIA
    await supabase.from("denuncias").insert([
      {
        valor,
        tipo,
        motivo,
        detalhes,
      },
    ]);

    // LISTA NEGRA
    await supabase.from("lista_negra").upsert([
      {
        valor,
        tipo,
        motivo,
        risco: "ALTO RISCO",
      },
    ]);

    // BUSCA REPUTAÇÃO
    const { data: reputacao } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", valor)
      .limit(1);

    if (reputacao && reputacao.length > 0) {
      const novaPontuacao = reputacao[0].pontuacao + 20;
      const novoTotal = reputacao[0].denuncias + 1;

      await supabase
        .from("reputacoes")
        .update({
          denuncias: novoTotal,
          pontuacao: novaPontuacao,
          status: calcularStatus(novaPontuacao),
        })
        .eq("valor", valor);
    } else {
      await supabase.from("reputacoes").insert([
        {
          valor,
          tipo,
          denuncias: 1,
          pontuacao: 50,
          status: "SUSPEITO",
        },
      ]);
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor AntiGolpe rodando");
});