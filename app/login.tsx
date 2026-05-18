import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../supabase';

export default function Login() {

  const [email, setEmail] = useState('');

  const [senha, setSenha] = useState('');

  const [loading, setLoading] =
    useState(false);

  async function entrar() {

    if (!email || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha email e senha.'
      );

      return;
    }

    try {

      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({

          email,
          password: senha,

        });

      if (error) {

        Alert.alert(
          'Erro no login',
          error.message
        );

        return;
      }

      Alert.alert(
        'Sucesso',
        'Login realizado com sucesso.'
      );

      router.replace('/');

    } catch (err) {

      Alert.alert(
        'Erro',
        'Falha inesperada ao entrar.'
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <KeyboardAvoidingView

      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }

      style={styles.container}
    >

      <View style={styles.content}>

        {/* LOGO */}
        <Text style={styles.logo}>
          🛡️ AntiGolpe BR
        </Text>

        <Text style={styles.subtitle}>
          Segurança inteligente contra golpes digitais
        </Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Seu email"
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* SENHA */}
        <TextInput
          placeholder="Sua senha"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* BOTÃO LOGIN */}
        <TouchableOpacity
          style={styles.button}
          onPress={entrar}
          disabled={loading}
        >

          <Text style={styles.buttonText}>

            {loading
              ? 'Entrando...'
              : 'ENTRAR'}

          </Text>

        </TouchableOpacity>

        {/* CADASTRO */}
        <TouchableOpacity
          onPress={() =>
            router.push('/cadastro')
          }
        >

          <Text style={styles.link}>
            Criar nova conta
          </Text>

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    justifyContent: 'center',
    padding: 24,
  },

  content: {
    width: '100%',
  },

  logo: {
    fontSize: 34,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 15,
    lineHeight: 22,
  },

  input: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2d36',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#00FF88',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    color: '#00BFFF',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 15,
  },
});