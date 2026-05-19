import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrar = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha.trim(),
      options: {
        data: {
          nome: nome,
        },
      },
    });

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert(
        'Confirme seu email',
        'Verifique seu email antes de entrar.'
      );
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

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
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.btn} onPress={cadastrar}>
        <Text style={styles.btnText}>Cadastrar</Text>
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
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  btn: {
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