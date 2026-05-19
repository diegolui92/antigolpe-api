import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

export default function App() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<any>(null);

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
          }),
        }
      );

      const data = await response.json();

      setResultado(data);
    } catch (error) {
      Alert.alert("Erro", "Erro ao verificar");
    }
  }

  async function denunciar() {
    try {
      const response = await fetch(
        "https://antigolpe-api-production.up.railway.app/api/denunciar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            valor: texto,
            motivo: "Denunciado pela comunidade",
            detalhes: "Possível golpe",
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert("Sucesso", "Denúncia registrada");

        verificar();
      } else {
        Alert.alert("Erro", data.erro || "Erro ao denunciar");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao denunciar");
    }
  }

  function corStatus(status: string) {
    if (status === "SEGURO") return "#22c55e";
    if (status === "SUSPEITO") return "#f59e0b";
    if (status === "ALTO RISCO") return "#ef4444";

    return "#ffffff";
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#020617",
        padding: 25,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 42,
          fontWeight: "bold",
          marginTop: 60,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        AntiGolpe
      </Text>

      <TextInput
        placeholder="Digite site, chave pix, telefone..."
        placeholderTextColor="#aaa"
        value={texto}
        onChangeText={setTexto}
        multiline
        style={{
          backgroundColor: "#0f172a",
          color: "#fff",
          borderRadius: 20,
          padding: 20,
          fontSize: 22,
          minHeight: 180,
          marginBottom: 25,
        }}
      />

      <TouchableOpacity
        onPress={verificar}
        style={{
          backgroundColor: "#22c55e",
          padding: 22,
          borderRadius: 20,
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 24,
            textAlign: "center",
          }}
        >
          Verificar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={denunciar}
        style={{
          backgroundColor: "#ef4444",
          padding: 22,
          borderRadius: 20,
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 24,
            textAlign: "center",
          }}
        >
          Denunciar
        </Text>
      </TouchableOpacity>

      {resultado && (
        <View
          style={{
            backgroundColor: "#0f172a",
            padding: 25,
            borderRadius: 25,
            marginBottom: 50,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              marginBottom: 10,
            }}
          >
            Tipo: {resultado.tipo}
          </Text>

          <Text
            style={{
              color: corStatus(resultado.status),
              fontSize: 34,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Status: {resultado.status}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              marginBottom: 15,
            }}
          >
            Score: {resultado.score}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              marginBottom: 15,
            }}
          >
            Denúncias: {resultado.denuncias || 0}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            Motivo:
          </Text>

          <Text
            style={{
              color: "#cbd5e1",
              fontSize: 20,
              marginBottom: 20,
            }}
          >
            {resultado.motivo}
          </Text>

          {resultado.motivos &&
            resultado.motivos.map((item: any, index: number) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#1e293b",
                  padding: 15,
                  borderRadius: 15,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  • {item}
                </Text>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}