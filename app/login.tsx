import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        Alert.alert('Confirme seu email antes de entrar.');
      } else {
        Alert.alert('Erro', error.message);
      }
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AntiGolpe 🚫</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btnLogin} onPress={login}>
        <Text style={styles.btnText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCadastro}
        onPress={() => router.push('/cadastro')}
      >
        <Text style={styles.btnText}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  btnLogin: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnCadastro: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});