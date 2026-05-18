import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';
import { supabase } from '../supabase';

type Modo = 'auto' | 'link' | 'telefone' | 'pix';

export default function Home() {

  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [consulta, setConsulta] = useState('');

  const [resultado, setResultado] = useState('');
  const [corResultado, setCorResultado] = useState('#00FF88');
  const [modo, setModo] = useState<Modo>('auto');

  useEffect(() => {
    verificarUsuario();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_, session) => {
        if (!session) {
          router.replace('/login');
        } else {
          setUsuario(session.user);
        }
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  async function verificarUsuario() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.replace('/login');
      return;
    }

    setUsuario(data.session.user);
    setLoading(false);
  }

  // =========================
  // 🔥 API
  // =========================
  async function verificarRisco() {

    Keyboard.dismiss();

    if (!consulta.trim()) {
      Alert.alert('Digite algo');
      return;
    }

    try {

      const response = await fetch('http://192.168.1.38:3000/api/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: consulta,
          tipo: modo
        })
      });

      const data = await response.json();

      let cor = '#00FF88';
      if (data.risco === 'alto') cor = '#FF3B30';
      else if (data.risco === 'suspeito') cor = '#FFD60A';

      setCorResultado(cor);

      setResultado(
`${data.tipo || 'Resultado'}

${data.risco?.toUpperCase() || ''}

${data.mensagem || ''}

Score: ${data.score ?? 0}/100`
      );

    } catch (error) {
      Alert.alert('Erro ao conectar com servidor');
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF88" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ AntiGolpe BR</Text>
          <TouchableOpacity onPress={sair}>
            <Text style={styles.logout}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.userText}>
          👤 {usuario?.email}
        </Text>

        <View style={styles.modos}>
          <BotaoModo label="AUTO" ativo={modo === 'auto'} onPress={() => setModo('auto')} />
          <BotaoModo label="🔗" ativo={modo === 'link'} onPress={() => setModo('link')} />
          <BotaoModo label="📱" ativo={modo === 'telefone'} onPress={() => setModo('telefone')} />
          <BotaoModo label="💳" ativo={modo === 'pix'} onPress={() => setModo('pix')} />
        </View>

        <TextInput
          value={consulta}
          onChangeText={setConsulta}
          placeholder="Digite link, telefone ou pix"
          placeholderTextColor="#777"
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={verificarRisco}>
          <Text style={styles.buttonText}>ANALISAR</Text>
        </TouchableOpacity>

        {resultado !== '' && (
          <View style={styles.resultBox}>
            <Text style={[styles.resultado, { color: corResultado }]}>
              {resultado}
            </Text>

            <TouchableOpacity style={styles.denunciarBtn}>
              <Text style={styles.denunciarText}>🚨 Denunciar</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Protegido | Espaço para anúncios
        </Text>
      </View>

    </View>
  );
}

function BotaoModo({ label, ativo, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.modoBtn,
        ativo && { backgroundColor: '#00FF88' }
      ]}
    >
      <Text style={[
        styles.modoText,
        ativo && { color: '#000' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f1117',
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logout: {
    color: '#FF453A',
  },
  userText: {
    color: '#777',
    marginVertical: 15,
  },
  modos: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modoBtn: {
    flex: 1,
    backgroundColor: '#1c1f26',
    padding: 12,
    margin: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  modoText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#1c1f26',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#00FF88',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 20,
  },
  resultado: {
    fontSize: 16,
  },
  denunciarBtn: {
    backgroundColor: '#FF3B30',
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  denunciarText: {
    color: '#fff',
  },
  footer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1f26',
  },
  footerText: {
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});