const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// DETECTAR TIPO
function detectarTipo(texto) {
  if (texto.includes("@")) return "EMAIL";

  if (
    texto.includes("http") ||
    texto.includes(".com") ||
    texto.includes(".xyz")
  ) {
    return "SITE";
  }

  if (texto.length >= 11) {
    return "TELEFONE/PIX";
  }

  return "DESCONHECIDO";
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

    // CONSULTA REPUTAÇÃO
    const { data: reputacao, error: erroReputacao } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", texto)
      .limit(1);

    if (erroReputacao) {
      console.log("ERRO REPUTACAO:");
      console.log(erroReputacao);
    }

    // CONSULTA DENÚNCIAS
    const { data: denunciasBanco, error: erroDenuncias } = await supabase
      .from("lista_negra")
      .select("*")
      .eq("valor", texto);

    if (erroDenuncias) {
      console.log("ERRO DENUNCIAS:");
      console.log(erroDenuncias);
    }

    // SE EXISTE REPUTAÇÃO
    if (reputacao && reputacao.length > 0) {
      return res.json({
        tipo: reputacao[0].tipo || tipo,
        status: reputacao[0].status || "SUSPEITO",
        score: reputacao[0].pontuacao || 0,
        denuncias: reputacao[0].denuncias || 0,
        motivo: "Resultado baseado na reputação da comunidade",
        motivos:
          denunciasBanco?.map((item) => item.motivo) || [],
      });
    }

    // ANÁLISE PADRÃO IA
    let status = "SEGURO";
    let score = 0;
    let motivo = "Nenhum risco encontrado";

    if (
      texto.includes(".xyz") ||
      texto.includes("bit.ly") ||
      texto.includes("ganhe") ||
      texto.includes("pix")
    ) {
      status = "SUSPEITO";
      score = 40;
      motivo = "Domínio suspeito";
    }

    return res.json({
      tipo,
      status,
      score,
      denuncias: 0,
      motivo,
      motivos: [],
    });
  } catch (error) {
    console.log("ERRO GERAL VERIFICAR:");
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

    console.log("DENUNCIA RECEBIDA:", valor);

    if (!valor) {
      return res.status(400).json({
        erro: "Valor não enviado",
      });
    }

    const tipo = detectarTipo(valor);

    // SALVA LISTA NEGRA
    const { error: erroLista } = await supabase
      .from("lista_negra")
      .insert([
        {
          valor,
          tipo,
          motivo,
          detalhes,
          risco: "ALTO RISCO",
        },
      ]);

    if (erroLista) {
      console.log("ERRO LISTA NEGRA:");
      console.log(erroLista);

      return res.status(500).json({
        erro: erroLista.message,
      });
    }

    // BUSCA REPUTAÇÃO
    const { data: reputacao, error: erroBusca } = await supabase
      .from("reputacoes")
      .select("*")
      .eq("valor", valor)
      .limit(1);

    if (erroBusca) {
      console.log("ERRO BUSCA REPUTACAO:");
      console.log(erroBusca);
    }

    // ATUALIZA REPUTAÇÃO
    if (reputacao && reputacao.length > 0) {
      const { error: erroUpdate } = await supabase
        .from("reputacoes")
        .update({
          denuncias: reputacao[0].denuncias + 1,
          pontuacao: reputacao[0].pontuacao + 50,
          status: "ALTO RISCO",
        })
        .eq("valor", valor);

      if (erroUpdate) {
        console.log("ERRO UPDATE:");
        console.log(erroUpdate);
      }
    } else {
      const { error: erroInsert } = await supabase
        .from("reputacoes")
        .insert([
          {
            valor,
            tipo,
            denuncias: 1,
            pontuacao: 50,
            status: "ALTO RISCO",
          },
        ]);

      if (erroInsert) {
        console.log("ERRO INSERT REPUTACAO:");
        console.log(erroInsert);
      }
    }

    return res.json({
      sucesso: true,
      mensagem: "Denúncia registrada",
    });
  } catch (error) {
    console.log("ERRO GERAL DENUNCIA:");
    console.log(error);

    return res.status(500).json({
      erro: "Erro ao denunciar",
    });
  }
});

// =========================
// SERVIDOR
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor AntiGolpe rodando");
});
