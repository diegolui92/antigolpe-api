import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';

import { searchWeb } from '../services/webSearch';

import {
  extractLinks,
  analyzeLink,
} from '../services/linkAnalyzer';

import { supabase } from '../../supabase';

export default function Home() {

  const [consulta, setConsulta] = useState('');

  const [resultado, setResultado] = useState('');

  const [corResultado, setCorResultado] =
    useState('#32D74B');

  const [fontes, setFontes] = useState<any[]>([]);

  const [denuncias, setDenuncias] =
    useState<any[]>([]);

  const [usuario, setUsuario] =
    useState<any>(null);

  // 🚀 CARREGAR APP
  useEffect(() => {

    carregarUsuario();

    carregarDenuncias();

    const channel = supabase
      .channel('denuncias-global')

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'denuncias',
        },

        () => {
          carregarDenuncias();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  // 👤 CARREGAR USUÁRIO
  async function carregarUsuario() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUsuario(user);
    }
  }

  // 🌍 CARREGAR DENÚNCIAS
  async function carregarDenuncias() {

    const { data } = await supabase

      .from('denuncias')

      .select('*')

      .order('created_at', {
        ascending: false,
      });

    if (data) {
      setDenuncias(data);
    }
  }

  // 🚨 VERIFICAR RISCO
  async function verificarRisco() {

    Keyboard.dismiss();

    const texto =
      consulta.toLowerCase().trim();

    if (!texto) {

      setResultado(
        'Digite um link, domínio ou mensagem para análise.'
      );

      setCorResultado('#FFD60A');

      return;
    }

    let motivos: string[] = [];

    // 🔗 EXTRAIR LINKS
    const links =
      extractLinks(texto);

    // 🔍 ANALISAR LINKS
    links.forEach((link) => {

      const analysis =
        analyzeLink(link);

      motivos.push(...analysis.reasons);
    });

    // 🌍 SAFE BROWSING
    const web =
      await searchWeb(texto);

    setFontes(web);

    // 🚨 VERIFICAÇÕES
    const possuiClonagem =
      motivos.some((m) =>
        m.includes('clonagem')
      );

    const possuiDominioSuspeito =
      motivos.some((m) =>
        m.includes('Domínio suspeito')
      );

    const possuiLetrasRepetidas =
      motivos.some((m) =>
        m.includes('repetidas')
      );

    const possuiAmeacaGoogle =
      web.length > 0;

    // 🔴 ALTO RISCO
    if (
      possuiAmeacaGoogle ||
      possuiClonagem ||
      possuiDominioSuspeito
    ) {

      setCorResultado('#FF453A');

      setResultado(
`🔴 ALTO RISCO

Possível tentativa de phishing, clonagem ou fraude detectada.

Evite inserir:
• senhas
• códigos PIX
• cartões
• documentos pessoais

📌 Evidências:
${motivos.length > 0
  ? motivos.join('\n')
  : 'Ameaça identificada por fontes externas.'}`
      );

      return;
    }

    // 🟡 SUSPEITO
    if (
      possuiLetrasRepetidas ||
      motivos.length >= 2
    ) {

      setCorResultado('#FFD60A');

      setResultado(
`🟡 SUSPEITO

Foram encontrados comportamentos incomuns neste conteúdo.

Recomenda-se cautela antes de prosseguir.

📌 Evidências:
${motivos.join('\n')}`
      );

      return;
    }

    // 🟢 SEGURO
    setCorResultado('#32D74B');

    setResultado(
`🟢 SEGURO

Nenhum comportamento suspeito relevante foi identificado.

⚠️ Mesmo assim:
• confirme URLs
• evite compartilhar senhas
• valide informações importantes`
    );
  }

  // 🚨 ENVIAR DENÚNCIA
  async function denunciar() {

    const texto =
      consulta.trim();

    if (!texto) return;

    await supabase
      .from('denuncias')
      .insert([
        {
          texto,
        },
      ]);

    alert(
      'Denúncia enviada para a rede global.'
    );

    setConsulta('');
  }

  return (

    <SafeAreaView style={styles.safe}>

      <ScrollView
        contentContainerStyle={
          styles.container
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.headerTop}>

            <View>

              <Text style={styles.logo}>
                🛡️ AntiGolpe BR
              </Text>

              <Text style={styles.subtitle}>
                Inteligência antifraude colaborativa
              </Text>

            </View>

            <TouchableOpacity
              style={styles.userButton}
            >

              <Text style={styles.userText}>
                {usuario
                  ? '👤 Online'
                  : '🔐 Login'}
              </Text>

            </TouchableOpacity>

          </View>

        </View>

        {/* INPUT */}
        <TextInput
          value={consulta}
          onChangeText={setConsulta}
          placeholder='Digite link, domínio ou mensagem'
          placeholderTextColor='#777'
          style={styles.input}
          autoCapitalize='none'
        />

        {/* BOTÃO ANALISAR */}
        <TouchableOpacity
          style={styles.button}
          onPress={verificarRisco}
        >

          <Text style={styles.buttonText}>
            ANALISAR CONTEÚDO
          </Text>

        </TouchableOpacity>

        {/* BOTÃO DENÚNCIA */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={denunciar}
        >

          <Text style={styles.reportText}>
            🚨 ENVIAR DENÚNCIA
          </Text>

        </TouchableOpacity>

        {/* RESULTADO */}
        {resultado !== '' && (

          <View style={styles.resultBox}>

            <Text
              style={[
                styles.resultado,
                {
                  color: corResultado,
                },
              ]}
            >
              {resultado}
            </Text>

          </View>
        )}

        {/* FONTES */}
        {fontes.length > 0 && (

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              🌍 Verificações externas
            </Text>

            {fontes.map((item, i) => (

              <View
                key={i}
                style={styles.card}
              >

                <Text style={styles.cardTitle}>
                  {item.titulo}
                </Text>

                <Text style={styles.cardUrl}>
                  {item.url}
                </Text>

                <Text style={styles.cardDesc}>
                  {item.descricao}
                </Text>

              </View>
            ))}

          </View>
        )}

        {/* FEED */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            🌍 Rede Global de Denúncias
          </Text>

          {denuncias
            .slice(0, 10)
            .map((d, i) => (

              <View
                key={i}
                style={styles.card}
              >

                <Text style={styles.feedText}>
                  {d.texto}
                </Text>

              </View>
            ))}

        </View>

        {/* RODAPÉ ADS/PARCERIAS */}
        <View style={styles.footer}>

          <Text style={styles.footerTitle}>
            🤝 Parceiros verificados
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <View style={styles.partnerCard}>
              <Text style={styles.partnerName}>
                Google Safe Browsing
              </Text>

              <Text style={styles.partnerDesc}>
                Proteção contra phishing
              </Text>
            </View>

            <View style={styles.partnerCard}>
              <Text style={styles.partnerName}>
                VirusTotal
              </Text>

              <Text style={styles.partnerDesc}>
                Reputação global de links
              </Text>
            </View>

            <View style={styles.partnerCard}>
              <Text style={styles.partnerName}>
                Parceiro futuro
              </Text>

              <Text style={styles.partnerDesc}>
                Espaço publicitário
              </Text>
            </View>

          </ScrollView>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#0f1117',
  },

  container: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 80,
  },

  header: {
    marginBottom: 25,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#999',
    marginTop: 4,
  },

  userButton: {
    backgroundColor: '#1c1f26',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },

  userText: {
    color: '#fff',
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2d36',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#00FF88',
    padding: 16,
    borderRadius: 14,
    marginTop: 15,
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  reportButton: {
    backgroundColor: '#FF453A',
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    alignItems: 'center',
  },

  reportText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  resultBox: {
    marginTop: 25,
    backgroundColor: '#1c1f26',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },

  resultado: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
  },

  section: {
    marginTop: 35,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#1c1f26',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },

  cardTitle: {
    color: '#FF453A',
    fontWeight: 'bold',
    marginBottom: 5,
  },

  cardUrl: {
    color: '#00BFFF',
    marginBottom: 5,
  },

  cardDesc: {
    color: '#ccc',
  },

  feedText: {
    color: '#fff',
  },

  footer: {
    marginTop: 40,
    marginBottom: 40,
  },

  footerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  partnerCard: {
    width: 220,
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },

  partnerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },

  partnerDesc: {
    color: '#999',
    lineHeight: 20,
  },
});