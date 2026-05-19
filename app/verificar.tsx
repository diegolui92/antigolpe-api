import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function VerificarScreen() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  function identificarTipo(valor: string) {
    const texto = valor.trim();

    // EMAIL
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
      return "EMAIL";
    }

    // SITE
    if (
      texto.includes("www.") ||
      texto.includes(".com") ||
      texto.includes(".net") ||
      texto.includes(".org") ||
      texto.includes("http")
    ) {
      return "SITE";
    }

    // TELEFONE
    const numeros = texto.replace(/\D/g, "");

    if (numeros.length >= 10 && numeros.length <= 13) {
      return "TELEFONE";
    }

    // CPF
    if (numeros.length === 11) {
      return "CPF";
    }

    // PIX
    if (
      texto.toLowerCase().includes("pix") ||
      texto.toLowerCase().includes("chave")
    ) {
      return "PIX";
    }

    return "TEXTO";
  }

  async function verificar() {
    try {
      const response = await fetch(
        "https://antigolpe-api-production.up.railway.app/api/verificar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texto,
            api_key: "ag_d221603c842605a2514d3d837e732d06",
          }),
        }
      );

      const data = await response.json();

      const tipo = identificarTipo(texto);

      setResultado({
        ...data,
        tipo,
      });
    } catch (error) {
      console.log(error);

      setResultado({
        status: "ERRO",
        score: 0,
        mensagem: "Erro ao conectar API",
        tipo: "ERRO",
      });
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AntiGolpe</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite telefone, site, email ou texto"
        placeholderTextColor="#999"
        multiline
        value={texto}
        onChangeText={setTexto}
      />

      <TouchableOpacity style={styles.button} onPress={verificar}>
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>

      {resultado && (
        <View style={styles.resultado}>
          <Text style={styles.tipo}>
            Tipo: {resultado.tipo || "Desconhecido"}
          </Text>

          <Text
            style={[
              styles.status,
              {
                color:
                  resultado.status === "ALTO RISCO"
                    ? "#ff4d4d"
                    : "#00ff99",
              },
            ]}
          >
            Status: {resultado.status}
          </Text>

          <Text style={styles.score}>Score: {resultado.score}</Text>

          <Text style={styles.mensagem}>
            {resultado.mensagem}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d22",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#16233d",
    color: "#fff",
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    fontSize: 18,
  },

  button: {
    backgroundColor: "#00c26e",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  resultado: {
    backgroundColor: "#09152d",
    marginTop: 30,
    borderRadius: 20,
    padding: 20,
  },

  tipo: {
    color: "#ccc",
    fontSize: 18,
    marginBottom: 15,
  },

  status: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  score: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 15,
  },

  mensagem: {
    color: "#ccc",
    fontSize: 18,
    lineHeight: 28,
  },
});