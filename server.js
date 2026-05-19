const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// ================= SUPABASE =================

const supabase = createClient(
  "https://ojuiufrckgwndhqnqxmo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl1ZnJja2d3bmRocW5xeG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDQwNDcsImV4cCI6MjA5NDM4MDA0N30.e-nV3mfYha04gHOEwl9b4q55Ukzio029GDb5DzJBAEc"
);

// ================= FUNÇÕES =================

function gerarApiKey() {
  return "ag_" + crypto.randomBytes(16).toString("hex");
}

function detectarTipo(texto) {
  texto = texto.trim();

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
    return "EMAIL";
  }

  if (
    texto.includes("www.") ||
    texto.includes(".com") ||
    texto.includes(".net") ||
    texto.includes(".org") ||
    texto.includes("http")
  ) {
    return "SITE";
  }

  const numeros = texto.replace(/\D/g, "");

  if (numeros.length >= 10 && numeros.length <= 13) {
    return "TELEFONE";
  }

  if (numeros.length === 11) {
    return "CPF";
  }

  if (
    texto.toLowerCase().includes("pix") ||
    texto.toLowerCase().includes("chave")
  ) {
    return "PIX";
  }

  return "TEXTO";
}

function analisarRisco(texto, tipo) {
  const t = texto.toLowerCase();

  let score = 0;
  let motivos = [];

  // FRASES SUSPEITAS
  const palavras = [
    "pix",
    "urgente",
    "clique aqui",
    "dinheiro rápido",
    "ganhe dinheiro",
    "premio",
    "senha",
    "cartão",
    "gratuito",
    "100% garantido",
    "renda extra",
    "liberação imediata",
  ];

  palavras.forEach((p) => {
    if (t.includes(p)) {
      score += 20;
      motivos.push(p);
    }
  });

  // SITE SUSPEITO
  if (tipo === "SITE") {
    if (
      t.includes(".xyz") ||
      t.includes(".top") ||
      t.includes(".click") ||
      t.includes(".shop")
    ) {
      score += 40;
      motivos.push("domínio suspeito");
    }

    if (
      t.includes("goog1e") ||
      t.includes("faceboook") ||
      t.includes("mercadolivre-premio")
    ) {
      score += 60;
      motivos.push("possível phishing");
    }
  }

  // EMAIL SUSPEITO
  if (tipo === "EMAIL") {
    if (
      t.includes("suporte-banco") ||
      t.includes("premio") ||
      t.includes("bonus")
    ) {
      score += 40;
      motivos.push("email suspeito");
    }
  }

  // TELEFONE
  if (tipo === "TELEFONE") {
    if (t.startsWith("0800")) {
      score += 10;
      motivos.push("telefone mascarado");
    }
  }

  let status = "SEGURO";

  if (score >= 80) {
    status = "ALTO RISCO";
  } else if (score >= 40) {
    status = "SUSPEITO";
  }

  return {
    status,
    score,
    mensagem:
      motivos.length > 0
        ? motivos.join(" | ")
        : "Nenhum risco encontrado",
  };
}

// ================= ROTAS =================

// TESTE
app.get("/", (req, res) => {
  res.send("API AntiGolpe funcionando 🚀");
});

// CRIAR CHAVE
app.post("/api/criar-chave", async (req, res) => {
  try {
    const { nome } = req.body;

    const api_key = gerarApiKey();

    const { error } = await supabase.from("api_keys").insert([
      {
        nome,
        api_key,
      },
    ]);

    if (error) {
      return res.status(500).json({
        erro: error.message,
      });
    }

    res.json({
      api_key,
    });
  } catch (err) {
    res.status(500).json({
      erro: err.message,
    });
  }
});

// VERIFICAR
app.post("/api/verificar", async (req, res) => {
  try {
    const { texto, api_key } = req.body;

    if (!texto || !api_key) {
      return res.status(400).json({
        erro: "Texto e API Key obrigatórios",
      });
    }

    const tipo = detectarTipo(texto);

    const resultado = analisarRisco(texto, tipo);

    res.json({
      tipo,
      ...resultado,
    });
  } catch (err) {
    res.status(500).json({
      erro: err.message,
    });
  }
});

// ================= SERVIDOR =================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
