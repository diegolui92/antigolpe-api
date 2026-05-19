const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  "https://ojuiufrckgwndhqnqxmo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc"
);

function gerarApiKey() {
  return "ag_" + crypto.randomBytes(16).toString("hex");
}

function detectarTipo(texto) {
  texto = texto.toLowerCase();

  if (texto.includes("@")) return "EMAIL";

  if (
    texto.includes("www.") ||
    texto.includes(".com") ||
    texto.includes("http")
  ) {
    return "SITE";
  }

  const numeros = texto.replace(/\D/g, "");

  if (numeros.length >= 10 && numeros.length <= 13) {
    return "TELEFONE";
  }

  if (texto.includes("pix")) {
    return "PIX";
  }

  return "TEXTO";
}

app.get("/", (req, res) => {
  res.send("API AntiGolpe online");
});

app.post("/api/verificar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({
        erro: "Texto não enviado",
      });
    }

    // CONSULTA BLACKLIST
    const { data: blacklist } = await supabase
      .from("lista_negra")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    if (blacklist && blacklist.length > 0) {
      return res.json({
        tipo: blacklist[0].tipo || detectarTipo(texto),
        status: blacklist[0].risco || "ALTO RISCO",
        score: 100,
        motivo: blacklist[0].motivo || "Item denunciado",
      });
    }

    // CONSULTA REPUTAÇÃO
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

    // DETECÇÃO LOCAL
    let score = 0;
    let status = "SEGURO";
    let motivo = "Nenhum risco encontrado";

    if (
      texto.includes(".xyz") ||
      texto.includes("ganhe dinheiro") ||
      texto.includes("pix urgente")
    ) {
      score = 40;
      status = "SUSPEITO";
      motivo = "Domínio suspeito";
    }

    if (
      texto.includes("clique aqui") ||
      texto.includes("urgente")
    ) {
      score += 40;
      status = "ALTO RISCO";
      motivo = "Tentativa suspeita detectada";
    }

    return res.json({
      tipo: detectarTipo(texto),
      status,
      score,
      motivo,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      erro: "Erro interno",
    });
  }
});

app.post("/api/denunciar", async (req, res) => {
  try {
    const { valor, motivo, detalhes } = req.body;

    if (!valor) {
      return res.status(400).json({
        erro: "Valor não enviado",
      });
    }

    const tipo = detectarTipo(valor);

    // INSERE NA LISTA NEGRA
    await supabase.from("lista_negra").insert([
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
      await supabase
        .from("reputacoes")
        .update({
          denuncias: reputacao[0].denuncias + 1,
          pontuacao: reputacao[0].pontuacao + 50,
          status: "ALTO RISCO",
        })
        .eq("valor", valor);
    } else {
      await supabase.from("reputacoes").insert([
        {
          valor,
          tipo,
          denuncias: 1,
          pontuacao: 50,
          status: "ALTO RISCO",
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
  console.log("Servidor rodando");
});
